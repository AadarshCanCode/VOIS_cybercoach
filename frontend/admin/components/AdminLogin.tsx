import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Settings, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

interface AdminLoginProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await (login as (email: string, password: string, role: 'admin') => Promise<boolean>)(email, password, 'admin');
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full animate-pulse group-hover:blur-2xl transition-all duration-500" />
              <Shield className="relative h-20 w-20 text-primary animate-float" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">Admin Access</h2>
          <p className="text-muted-foreground">Secure administrative portal</p>
        </div>

        <Card variant="cyber" className="backdrop-blur-xl border-primary/20">
          <CardContent className="p-8 space-y-6">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </button>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-scale-in">
                <p className="text-destructive text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                  <Settings className="h-8 w-8 text-primary animate-spin-slow" />
                </div>
              </div>

              <Input
                label="Administrator Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email"
                leftIcon={<Shield className="h-4 w-4" />}
                className="bg-background/50"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
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

              <Button
                type="submit"
                variant="cyber"
                isLoading={isLoading}
                className="w-full h-12 text-lg shadow-lg shadow-primary/20"
              >
                {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </form>

            <div className="bg-muted/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center text-muted-foreground mb-2">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium text-foreground text-sm">Security Notice</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Admin access is restricted to authorized personnel only. All login attempts are monitored and logged.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};