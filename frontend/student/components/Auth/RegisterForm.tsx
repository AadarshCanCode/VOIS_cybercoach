import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Users, X, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Card, CardContent } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

interface RegisterFormProps {
  userType?: 'student' | 'teacher' | null;
  onToggleMode: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  userType, 
  onToggleMode, 
  onBack,
  onSuccess 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>(userType || 'student');
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await register(email, password, name, role, bio, specialization);
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10">
        <Card variant="cyber" className="backdrop-blur-xl border-primary/20 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <CardContent className="p-8 space-y-5">

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-scale-in">
              <p className="text-destructive text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!userType && (
              <div className="space-y-3 mb-1">
                <label className="block text-sm font-medium text-foreground">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-300 ${
                      role === 'student' 
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <GraduationCap className={`h-6 w-6 mx-auto mb-1 transition-all ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className={`text-xs font-medium ${role === 'student' ? 'text-primary' : 'text-foreground'}`}>Learn</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Student</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`group relative p-3 rounded-lg border-2 transition-all duration-300 ${
                      role === 'teacher' 
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <Users className={`h-6 w-6 mx-auto mb-1 transition-all ${role === 'teacher' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className={`text-xs font-medium ${role === 'teacher' ? 'text-primary' : 'text-foreground'}`}>Teach</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Instructor</div>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                leftIcon={<User className="h-4 w-4" />}
                className="bg-background/50"
              />

              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-background/50"
              />
            </div>

            {role === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Specialization"
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., Web Security, Network Security"
                  className="bg-background/50"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Brief description about yourself"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[34px] -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Input
                label="Confirm Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                className="bg-background/50"
              />
            </div>

            <Button
              type="submit"
              variant="cyber"
              isLoading={isLoading}
              className="w-full h-11 text-base font-semibold"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-300 hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};