import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '@context/AuthContext';
import { CourseCreation } from './CourseCreation';
import { CourseAnalytics } from './CourseAnalytics';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({ name: '', organization: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email) {
      checkOnboardingStatus();
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBase}/api/teacher/courses/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiBase}/api/teacher/profile/${user?.email}`);
      const data = await response.json();
      setIsOnboarded(data.exists);
      if (data.teacher) {
        setFormData({ name: data.teacher.name, organization: data.teacher.organization });
      }
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      alert(`Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Analytics State
  const [showAnalyticsFor, setShowAnalyticsFor] = useState<{ id: string, title: string } | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isOnboarded) {
    // ... (keep existing onboarding UI)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        {/* ... existing onboarding form ... */}
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

  // Analytics View
  if (showAnalyticsFor) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="p-8">
          <CourseAnalytics
            courseId={showAnalyticsFor.id}
            courseTitle={showAnalyticsFor.title}
            onBack={() => setShowAnalyticsFor(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            + Create Course
          </button>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-8">
          <p className="text-slate-400">
            Welcome back! You are fully onboarded.
            <br />
            <span className="text-emerald-500">Organization: {formData.organization || 'Loading...'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-mono border border-slate-700">
                  {course.code}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${course.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {course.published ? 'LIVE' : 'DRAFT'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{course.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span>{course.modules?.length || 0} Modules</span>
                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => setShowAnalyticsFor({ id: course._id, title: course.title })}
                className="w-full py-2 border border-emerald-500/30 text-emerald-500 rounded-lg hover:bg-emerald-500/10 transition-colors text-sm font-bold"
              >
                View Student Progress
              </button>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500">No courses created yet. Click the button above to get started.</p>
            </div>
          )}
        </div>

        {showWizard && (
          <CourseCreation
            onCancel={() => setShowWizard(false)}
            onSuccess={() => {
              setShowWizard(false);
              fetchCourses(); // Refresh list after creation
            }}
          />
        )}
      </div>
    </div>
  );
};