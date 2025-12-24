import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@services/authService';
import type { User } from '@types';
import { supabase } from '@lib/supabase';

interface AuthContextValue {
  user: (User & { role?: 'student' | 'teacher' | 'admin'; created_at?: string | Date }) | null;
  loading: boolean;
  login: (email: string, password: string, role?: 'student' | 'teacher' | 'admin') => Promise<boolean>;
  loginWithGoogle: (role?: 'student' | 'teacher') => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher' | 'admin',
    bio?: string,
    specialization?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial verification
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Listen for auth state changes (e.g. returning from Google OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            // If we get a session, verify/sync with our users table
            const syncedUser = await authService.handleAuthStateChange(session);
            if (syncedUser) {
              setUser(syncedUser);
            }
          } catch (error: any) {
            console.error('Auth sync error:', error);
            await authService.logout();
            setUser(null);

            // Redirect to login with error
            // We use window.location to force a full reload so the URL params are picked up by the Login component
            // Important: Redirect to /login specifically, as the root path might render LandingPage which doesn't show errors
            const url = new URL(window.location.origin + '/login');
            url.searchParams.set('error_description', error.message);
            window.location.href = url.toString();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'teacher' | 'admin' = 'student') => {
    try {
      const credentials = { email, password, role };
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (role: 'student' | 'teacher' = 'student') => {
    try {
      await authService.loginWithGoogle(role);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher' | 'admin' = 'student',
    bio?: string,
    specialization?: string
  ) => {
    try {
      const userData = { email, password, name, role, bio, specialization };
      const registeredUser = await authService.register(userData);
      setUser(registeredUser);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('cyberSecUser');
    try {
      await authService.logout();
    } catch (error) {
      console.error('AuthService logout error:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('cyberSecUser', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = () => {
    return authService.isAdmin();
  };

  const isTeacher = () => {
    return authService.isTeacher();
  };

  const isStudent = () => {
    return authService.isStudent();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser, isAdmin, isTeacher, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};