import { supabase, testSupabaseConnection } from '@lib/supabase';
import bcrypt from 'bcryptjs';
import type { User } from '@types';

type DBUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  password_hash?: string | null;
  [key: string]: unknown;
};

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sanitizeUser(dbUser: DBUser): User {
  const copy: Record<string, unknown> = { ...dbUser };

  // Transform DB fields to frontend CamelCase
  if ('completed_assessment' in copy) {
    copy['completedAssessment'] = copy['completed_assessment'];
    delete copy['completed_assessment'];
  }

  // Handle other potential mappings if needed
  if ('created_at' in copy) {
    copy['createdAt'] = copy['created_at'];
    delete copy['created_at'];
  }

  // remove password_hash if present
  if ('password_hash' in copy) {
    delete copy['password_hash'];
  }

  return copy as unknown as User;
}

class AuthService {
  async login(credentials: { email: string; password: string; role: string }): Promise<User | null> {
    try {
      // Proactively test connectivity for clearer errors (helps diagnose CORS/env issues)
      await testSupabaseConnection();
      // Primary auth: use Supabase Auth (creates client session so RLS works)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (signInError) {
        // If supabase auth fails, fall back to legacy DB check (maintains compatibility)
        console.warn('Supabase auth failed, attempting legacy DB fallback:', signInError.message);

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .eq('role', credentials.role)
          .maybeSingle();

        if (error) {
          console.error('Login error:', error);
          throw new Error(`Database error during login: ${error.message}`);
        }

        if (!user) throw new Error(`No ${credentials.role} account found with email: ${credentials.email}`);

        const isValidPassword = await bcrypt.compare(credentials.password, (user as DBUser).password_hash ?? '');
        if (!isValidPassword) throw new Error('Incorrect password. Please try again.');

        const userCopy = sanitizeUser(user as DBUser);
        localStorage.setItem('cyberSecUser', JSON.stringify(userCopy));
        return userCopy;
      }

      // Fetch profile row for signed-in user
      const sessionUser = signInData.user;
      if (!sessionUser) throw new Error('Signed in but no user returned from Supabase Auth');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', sessionUser.email)
        .maybeSingle();

      if (profileError) {
        console.warn('Failed to fetch profile row after sign-in:', profileError.message);
      }

      const profileRow = profile ? (profile as DBUser) : undefined;
      let profileCopy: User;
      if (profileRow) {
        profileCopy = sanitizeUser(profileRow);
      } else {
        profileCopy = { id: sessionUser.id, email: sessionUser.email, name: sessionUser.user_metadata?.full_name } as User;
      }
      // store to localStorage without password_hash
      localStorage.setItem('cyberSecUser', JSON.stringify(profileCopy));
      return profileCopy;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: { email: string; password: string; name?: string; role: string; bio?: string; specialization?: string }): Promise<User | null> {
    try {
      // Test connectivity first
      await testSupabaseConnection();

      // Hash the password for storage
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create account with Supabase Auth first (creates session client-side)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: { full_name: userData.name } }
      });

      if (signUpError) {
        console.error('Supabase signUp error:', signUpError);
        // If auth signup fails, still create a profile in the users table
        console.warn('Auth signup failed, proceeding with direct profile creation...');
      }

      const authUser = signUpData?.user;

      // Use auth user ID or generate a proper UUID if no auth user
      const userId = authUser?.id ?? generateUUID();

      // Insert profile row into users table
      const profileRow = {
        id: userId,
        email: userData.email,
        name: userData.name || 'User',
        role: userData.role,
        password_hash: passwordHash,
        level: 'beginner',
        completed_assessment: userData.role === 'admin',
        bio: userData.bio || '',
        specialization: userData.specialization || '',
        experience_years: userData.role === 'student' ? null : '0-1'
      } as Record<string, unknown>;

      const { data: newUser, error: profileError } = await supabase
        .from('users')
        .upsert([profileRow], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (profileError) {
        console.error('Registration error while creating profile:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      const finalUser = newUser || profileRow;
      const newUserCopy = { ...finalUser } as unknown as User;
      // Remove password_hash from stored user
      delete (newUserCopy as any).password_hash;
      localStorage.setItem('cyberSecUser', JSON.stringify(newUserCopy));
      return newUserCopy;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  async logout() {
    localStorage.removeItem('cyberSecUser');
    await supabase.auth.signOut();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('cyberSecUser');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      // Ensure we sanitize/map fields even for cached data
      return sanitizeUser(user);
    } catch (e) {
      console.error('Failed to parse user from local storage:', e);
      return null;
    }
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isTeacher() {
    const user = this.getCurrentUser();
    return user?.role === 'teacher';
  }

  isStudent() {
    const user = this.getCurrentUser();
    return user?.role === 'student';
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  async loginWithGoogle(role: 'student' | 'teacher' = 'student'): Promise<void> {
    try {
      localStorage.setItem('auth_pending_role', role);
      const redirectTo = window.location.origin; // Should be http://localhost:5173
      console.log('Initiating Google OAuth with redirect to:', redirectTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async handleAuthStateChange(session: any): Promise<User | null> {
    if (!session?.user) return null;

    const user = session.user;

    // Check if profile exists
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (profile) {
      // STRICT ROLE CHECK:
      // The user might be trying to log in as 'teacher' but already has a 'student' account (or vice versa).
      const requestedRole = localStorage.getItem('auth_pending_role');

      // Only enforce strict check if we actually have a requested role (i.e. came from the specific login button)
      if (requestedRole && profile.role !== requestedRole) {
        console.error(`Role mismatch! Existing: ${profile.role}, Requested: ${requestedRole}`);

        // Sign out immediately to prevent access
        await this.logout();
        await supabase.auth.signOut();

        throw new Error(`Access Denied: You already have a ${profile.role} account with this email. You cannot create a ${requestedRole} account.`);
      }

      const userCopy = sanitizeUser(profile as DBUser);
      localStorage.setItem('cyberSecUser', JSON.stringify(userCopy));
      // Clear pending role if any
      localStorage.removeItem('auth_pending_role');
      return userCopy;
    }

    // New User Creation
    // Retrieve role from localStorage or default to student
    const pendingRole = localStorage.getItem('auth_pending_role');
    const role = pendingRole || user.user_metadata?.role || 'student';
    localStorage.removeItem('auth_pending_role');

    const userId = user.id;

    const profileRow = {
      id: userId,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      role: role,
      level: 'beginner',
      completed_assessment: false,
      bio: '',
      specialization: '',
      experience_years: role === 'student' ? null : '0-1'
    } as Record<string, unknown>;

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .upsert([profileRow], { onConflict: 'id' })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user profile after OAuth:', createError);
      // Fallback: return basic info so app doesn't crash, but logged state might be partial
      const fallback = { ...profileRow } as unknown as User;
      localStorage.setItem('cyberSecUser', JSON.stringify(fallback));
      return fallback;
    }

    const newUserCopy = { ...newUser } as unknown as User;
    if ('password_hash' in (newUserCopy as any)) delete (newUserCopy as any).password_hash;

    localStorage.setItem('cyberSecUser', JSON.stringify(newUserCopy));
    return newUserCopy;
  }
}

export const authService = new AuthService();