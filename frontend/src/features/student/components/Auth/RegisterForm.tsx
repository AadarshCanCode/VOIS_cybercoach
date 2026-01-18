import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { AuthLayout } from '@components/auth/AuthLayout';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '@components/SEO/SEO';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role = 'student';
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
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
      // If register returns without throwing, it means auto-login worked
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      // Check if this is the success/confirmation required message we added in authService
      if (msg.includes('Success!') || msg.includes('check your email')) {
        setIsEmailSent(true);
        setError('');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Verification Required"
        className="max-w-2xl"
      >
        <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,136,0.05)] backdrop-blur-xl relative overflow-hidden group w-full text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 animate-pulse">
            <Mail className="h-8 w-8 text-[#00FF88]" />
          </div>

          <h3 className="text-[#00FF88] text-xl font-black mb-4 uppercase tracking-tighter">Email Sent!</h3>
          <p className="text-[#00B37A] text-sm mb-8 leading-relaxed">
            We've sent a confirmation link to <span className="text-[#00FF88] font-bold">{email}</span>.<br />
            Please click the link in the email to activate your account.
          </p>

          <div className="space-y-4">
            <Link to="/login" className="block">
              <Button className="w-full h-12 bg-[#00FF88] text-black hover:bg-[#00CC66] font-black rounded-xl">
                Return to Login
              </Button>
            </Link>

            <p className="text-[#00B37A]/50 text-[10px] uppercase font-mono">
              Didn't get the email? Check your spam folder.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Sign Up"
      subtitle="Student Registration"
      className="max-w-2xl"
    >
      <SEO
        title="Sign Up"
        description="Join the elite cybersecurity training platform. Create your account to start hands-on labs and assessments."
      />
      <div className="bg-[#0A0F0A] border border-[#00FF88]/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,136,0.05)] backdrop-blur-xl relative overflow-hidden group w-full">
        <div className="absolute inset-0 bg-linear-to-b from-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-500 text-xs font-mono uppercase tracking-widest text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<User className="h-4 w-4" />}
            />

            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Signing up...' : (
              <span className="flex items-center justify-center gap-2">
                Sign Up <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#00FF88]/10 flex flex-col items-center gap-4">
          <p className="text-[#00B37A] text-xs">Already have an account?</p>
          <Link to="/login" className="w-full relative z-20">
            <Button
              variant="outline"
              className="w-full border-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/10 font-bold rounded-xl transition-all"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};