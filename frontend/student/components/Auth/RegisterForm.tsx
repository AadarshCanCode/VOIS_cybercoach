import React, { useState } from 'react';
import { GraduationCap, Users, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';

interface RegisterFormProps {
  userType?: 'student' | 'teacher' | null;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  userType,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>(userType || 'student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register(email, password, name, role);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(role === 'teacher' ? '/teacher' : '/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Identity"
      subtitle={`Enlist as ${role}`}
      className="max-w-2xl"
    >
      <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,136,0.05)] backdrop-blur-xl relative overflow-hidden group w-full">
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
                Choose Branch
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
                  <span className="text-xs font-bold uppercase tracking-widest">Learner</span>
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
                  <span className="text-xs font-bold uppercase tracking-widest">Instructor</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Codename (Full Name)"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<User className="h-4 w-4" />}
              cyber
            />

            <Input
              label="Comms Frequency (Email)"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@network.cmd"
              leftIcon={<Mail className="h-4 w-4" />}
              cyber
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Input
              label="Verify Key"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Encrypting...' : (
              <span className="flex items-center justify-center gap-2">
                Establish Uplink <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#00FF88]/10 flex flex-col items-center gap-4">
          <p className="text-[#00B37A] text-[10px] font-mono uppercase tracking-[0.2em]">Already have an identity?</p>
          <Link to="/login" className="w-full relative z-20">
            <Button
              variant="outline"
              className="w-full border-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/10 font-bold uppercase tracking-widest rounded-xl transition-all"
            >
              Initialize Sign In_
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};