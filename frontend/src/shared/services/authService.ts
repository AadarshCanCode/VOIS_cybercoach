import { supabase } from '@lib/supabase';
import type { User } from '@types';

type DBUser = {
  id: string;
  full_name?: string | null;
  role?: string;
  created_at?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

// Timeout wrapper to prevent infinite hanging
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
  operationName: string = 'Operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operationName} timed out after ${timeoutMs / 1000} seconds. Please check your internet connection and try again.`)),
        timeoutMs
      )
    )
  ]);
}



function sanitizeUser(dbUser: DBUser, email?: string): User {
  return {
    id: dbUser.id,
    name: dbUser.full_name || email?.split('@')[0] || 'User',
    email: email || '',
    role: dbUser.role as 'student' | 'admin' | 'teacher',
    created_at: dbUser.created_at,
    avatar_url: (dbUser as any).avatar_url,
  };
}

class AuthService {




  async logout() {
    localStorage.removeItem('cyberSecUser');
    localStorage.removeItem('auth_pending_role');
    localStorage.removeItem('auth_pending_role_ts');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signOut error:', error);
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('cyberSecUser');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return sanitizeUser(user);
    } catch (e) {
      console.error('Failed to parse user from local storage:', e);
      return null;
    }
  }



  isStudent() {
    const user = this.getCurrentUser();
    return user?.role === 'student';
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  async loginWithGoogle(role: 'student' = 'student'): Promise<void> {
    try {
      localStorage.setItem('auth_pending_role', role);
      localStorage.setItem('auth_pending_role_ts', Date.now().toString());

      const redirectTo = window.location.origin;

      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        }),
        15000,
        'Google OAuth'
      );

      if (error) throw new Error(`Google login failed: ${error.message}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        throw new Error('Google login is taking too long. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  async handleAuthStateChange(session: any): Promise<User | null> {
    if (!session?.user) return null;

    const user = session.user;

    let profile: any = null;
    let profileError: any = null;

    try {
      // Retry loop to handle race conditions where profile creation might lag behind auth
      let attempts = 0;
      while (attempts < 3) {
        const result = await withTimeout(
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle() as unknown as Promise<any>,
          5000,
          `Profile fetch attempt ${attempts + 1}`
        ) as any;

        if (result.data) {
          profile = result.data;
          profileError = null;
          break;
        }

        attempts++;
        if (attempts < 3) await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      profileError = err;
    }

    if (profile) {
      const requestedRole = localStorage.getItem('auth_pending_role');
      const requestedRoleTs = localStorage.getItem('auth_pending_role_ts');
      let isValidRequest = false;
      if (requestedRole && requestedRoleTs) {
        const ts = parseInt(requestedRoleTs, 10);
        if (!isNaN(ts) && (Date.now() - ts < 5 * 60 * 1000)) isValidRequest = true;
      }

      if (isValidRequest && requestedRole && profile.role !== requestedRole) {
        await this.logout();
        await supabase.auth.signOut();
        throw new Error(`Access Denied: You already have a ${profile.role} account.`);
      }

      const userCopy = sanitizeUser(profile as DBUser, user.email);
      localStorage.setItem('cyberSecUser', JSON.stringify(userCopy));
      return userCopy;
    }

    if (!profile) {
      const metadata = user.user_metadata || {};
      const pendingRole = localStorage.getItem('auth_pending_role');

      // Fallback: Check if we have a valid cached user in localStorage to preserve role
      const cachedUserStr = localStorage.getItem('cyberSecUser');
      let cachedRole = null;
      if (cachedUserStr) {
        try {
          const cached = JSON.parse(cachedUserStr);
          if (cached && cached.email === user.email) {
            cachedRole = cached.role;
          }
        } catch (e) { /* ignore */ }
      }

      // Priority: Pending Role (Login/Signup) > Metadata Role > Cached Role > 'student'
      const role = pendingRole || metadata.role || cachedRole || 'student';

      console.warn(`Profile not found during sync. Constructing placeholder with role: ${role}`);

      const placeholderUser: any = {
        id: user.id,
        email: user.email,
        name: metadata.full_name || user.email?.split('@')[0] || 'User',
        role: role,
        level: 'beginner',
        avatar_url: metadata.avatar_url || metadata.picture,
        created_at: new Date().toISOString()
      };

      if (!profileError) {
        const createProfile = async () => {
          try {
            await supabase
              .from('profiles')
              .upsert([{
                id: user.id,
                full_name: placeholderUser.name,
                role: role,
              }]);
          } catch (e) {
            // Silently fail
          }
        };
        createProfile();
      }

      localStorage.setItem('cyberSecUser', JSON.stringify(placeholderUser));
      return placeholderUser as User;
    }

    return null;
  }
}

export const authService = new AuthService();