import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO/SEO';

interface LoginFormProps {
  userType?: 'student' | 'teacher' | null;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  userType,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<'teacher' | 'student'>(userType || 'student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await (login as (email: string, password: string, role: 'teacher' | 'student') => Promise<boolean>)(email, password, role);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(role === 'teacher' ? '/teacher' : '/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for OAuth errors in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get('error_description');
    const errorMsg = params.get('error');
    if (errorDescription || errorMsg) {
      setError(errorDescription || errorMsg || 'Authentication failed');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await loginWithGoogle(role);
    } catch (err) {
      setError('Google login failed');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle={role === 'teacher' ? 'Teacher Login' : 'Student Login'}
      className="max-w-md"
    >
      <SEO
        title="Login"
        description="Access your Cybercoach terminal. Sign in to continue your cybersecurity training and operations."
      />
      <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,136,0.05)] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-b from-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-500 text-xs font-mono uppercase tracking-widest text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">


          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle={true}
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-12 bg-[#00FF88] text-black hover:bg-[#00CC66] font-black rounded-xl transition-all group"
          >
            {isLoading ? 'Logging in...' : (
              <span className="flex items-center justify-center gap-2">
                Login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          {role !== 'teacher' && (
            <>
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#00FF88]/10" />
                </div>
                <div className="relative flex justify-center text-xs bg-[#0A0F0A] px-2 text-[#00B37A]">
                  Or continue with
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white text-black hover:bg-gray-100 font-bold rounded-xl transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Login with Google
              </Button>
            </>
          )}
        </form>

        {role !== 'teacher' && (
          <div className="mt-8 pt-6 border-t border-[#00FF88]/10 flex flex-col items-center gap-4">
            <p className="text-[#00B37A] text-xs">New user?</p>
            <Link to="/signup" className="w-full relative z-20">
              <Button
                variant="outline"
                className="w-full border-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/10 font-bold rounded-xl transition-all"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};