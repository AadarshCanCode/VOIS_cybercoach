import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@services/authService';
import type { User } from '@types';

interface AuthContextValue {
  user: (User & { role?: 'student' | 'teacher' | 'admin'; created_at?: string | Date }) | null;
  loading: boolean;
  login: (email: string, password: string, role?: 'student' | 'teacher' | 'admin') => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher' | 'admin',
    bio?: string,
    specialization?: string
  ) => Promise<boolean>;
  logout: () => void;
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
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
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

  const logout = () => {
    authService.logout();
    setUser(null);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin, isTeacher, isStudent }}>
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