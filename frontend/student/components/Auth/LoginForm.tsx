import React, { useState } from 'react';
import { GraduationCap, Users, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';

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
  const [role, setRole] = useState<'teacher' | 'student'>(userType || 'student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
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

  return (
    <AuthLayout
      title="Access Terminal"
      subtitle={`Authorized ${role} Entry`}
      className="max-w-md"
    >
      <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,136,0.05)] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-500 text-xs font-mono uppercase tracking-widest text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {!userType && (
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-[#00B37A] uppercase tracking-[0.2em] ml-1">
                Select Identity
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 relative z-20 ${role === 'student'
                      ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.1)]'
                      : 'bg-[#000000]/40 border-[#00FF88]/10 text-[#00B37A] hover:border-[#00FF88]/40 hover:bg-[#00FF88]/5'
                    }`}
                >
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 relative z-20 ${role === 'teacher'
                      ? 'bg-[#00FF88]/10 border-[#00FF88] text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.1)]'
                      : 'bg-[#000000]/40 border-[#00FF88]/10 text-[#00B37A] hover:border-[#00FF88]/40 hover:bg-[#00FF88]/5'
                    }`}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Teacher</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email Frequency"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@network.cmd"
              leftIcon={<Mail className="h-4 w-4" />}
              cyber
            />

            <Input
              label="Access Key"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              cyber
              showPasswordToggle={true}
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-12 bg-[#00FF88] text-black hover:bg-[#00CC66] font-black uppercase tracking-widest rounded-xl transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] group"
          >
            {isLoading ? 'Decrypting...' : (
              <span className="flex items-center justify-center gap-2">
                Initialize Session <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#00FF88]/10 flex flex-col items-center gap-4">
          <p className="text-[#00B37A] text-[10px] font-mono uppercase tracking-[0.2em]">New to the terminal?</p>
          <Link to="/signup" className="w-full relative z-20">
            <Button
              variant="outline"
              className="w-full border-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/10 font-bold uppercase tracking-widest rounded-xl transition-all"
            >
              Establish New Identity_
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};