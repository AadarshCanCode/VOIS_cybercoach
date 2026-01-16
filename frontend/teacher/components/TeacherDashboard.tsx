import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '@context/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({ name: '', organization: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBase}/api/teacher/profile/${user?.email}`);
      const data = await response.json();
      setIsOnboarded(data.exists);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBase}/api/teacher/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: formData.name,
          organization: formData.organization
        })
      });

      if (response.ok) {
        setIsOnboarded(true);
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Welcome, Instructor</h1>
          <p className="text-slate-400 text-center mb-6">Please complete your profile to continue.</p>

          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="e.g. Dr. Sarah Connor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Organization / University</label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="e.g. Cyberdyne Systems"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">
            Welcome back! You are fully onboarded.
            <br />
            <span className="text-emerald-500">Organization: {formData.organization || 'Loading...'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};