import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, FlaskRound as Flask, CheckCircle, Clock, Award } from 'lucide-react';
import { CertificateModal } from '../Certificates/CertificateModal';
import { courseService } from '@services/courseService';
import type { Module, Course } from '@types';
import { ModuleTest } from './ModuleTest';
import { VideoPlayer } from '../Video/VideoPlayer';
import { learningPathService } from '@services/learningPathService';
import { supabase } from '@lib/supabase';
import { useAuth } from '@context/AuthContext';

interface ModuleViewerProps {
  courseId: string;
  moduleId: string;
  onBack: () => void;
  onNavigateToModule?: (moduleId: string) => void;
  onModuleStatusChange?: () => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({ courseId, moduleId, onBack, onNavigateToModule, onModuleStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'lab' | 'test'>('content');
  const [showTest, setShowTest] = useState(false);
  const { user } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        if (mounted) setCourse(data);
      } catch (e) {
        console.error('Failed to load course for module viewer:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [courseId]);

  const module: Module | undefined = (course?.course_modules ?? course?.modules ?? []).find((m: Module) => m.id === moduleId);

  const isAllModulesCompleted = (course: Course) => {
    const modules = course.course_modules ?? course.modules ?? [];
    return modules.every(m => m.completed);
  };

  if (loading) return <div className="p-6 text-slate-200">Loading module...</div>;
  if (!course || !module) {
    return <div className="p-6 text-slate-200">Module not found</div>;
  }

  const allModules = course.course_modules ?? course.modules ?? [];
  const currentIndex = allModules.findIndex(m => m.id === moduleId);

  const goToNextModule = () => {
    if (currentIndex >= 0 && currentIndex < allModules.length - 1) {
      const next = allModules[currentIndex + 1];
      // Prefer calling parent navigation callback if provided
      if (onNavigateToModule) {
        onNavigateToModule(next.id);
        return;
      }

      // fallback: update history and dispatch event so parent can pick it up
      window.history.pushState({}, '', `/course/${courseId}?module=${next.id}`);
      const evt = new CustomEvent('navigateModule', { detail: { moduleId: next.id } });
      window.dispatchEvent(evt);
    }
  };

  const markModuleCompleted = async (skipTest = false) => {
    try {
      module.completed = true;
      setCourse({ ...course });

      if (user?.id) {
        await supabase.from('user_progress').upsert([{ user_id: user.id, course_id: courseId, module_id: moduleId, completed: true, quiz_score: module.testScore ?? null, source: skipTest ? 'manual' : 'test' }]);
        await learningPathService.rebalance(user.id, courseId);
        // inform parent to refresh progress
        if (onModuleStatusChange) onModuleStatusChange();
      }
    } catch (e) {
      console.error('Failed to mark module completed:', e);
    }
  };

  const completeCourseAndGenerateCertificate = async () => {
    // mark all modules completed if some are missing (for safety)
    try {
        if (user?.id) {
        const toUpsert = allModules.map(m => ({ user_id: user.id, course_id: courseId, module_id: m.id, completed: true, quiz_score: m.testScore ?? null, source: 'manual-course-complete' }));
        await supabase.from('user_progress').upsert(toUpsert);
        // inform parent to refresh progress, then show certificate
        if (onModuleStatusChange) await onModuleStatusChange();
        setShowCertificate(true);
      } else {
        setShowCertificate(true);
      }
    } catch (e) {
      console.error('Failed to complete course:', e);
    }
  };

  const handleTestCompletion = async (score: number) => {
    // Update module completion status
    module.completed = true;
    module.testScore = score;
    setShowTest(false);

    // Persist progress and trigger rebalance
    try {
        if (user?.id) {
        await supabase.from('user_progress').upsert([{ user_id: user.id, course_id: courseId, module_id: moduleId, completed: true, quiz_score: score, source: 'adaptive' }]);
        await learningPathService.rebalance(user.id, courseId);
        if (onModuleStatusChange) onModuleStatusChange();
      }
    } catch (e) {
      console.error('Failed to persist progress or rebalance:', e);
    }
  };

  if (showTest) {
    return (
      <ModuleTest
        moduleId={moduleId}
        moduleTitle={module.title}
        onComplete={handleTestCompletion}
        onBack={() => setShowTest(false)}
      />
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Course</span>
          </button>
          <div className="flex items-center space-x-4">
            {/* Mark as completed (manual) */}
            <button
              onClick={() => markModuleCompleted(true)}
              disabled={module.completed}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${module.completed ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-amber-600 text-slate-100 hover:bg-amber-700'}`}
              title="Mark this module as completed"
            >
              {module.completed ? 'Completed' : 'Mark as Completed'}
            </button>

            {/* Go to next module */}
              <button
                onClick={goToNextModule}
                disabled={currentIndex < 0 || currentIndex >= allModules.length - 1}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentIndex < 0 || currentIndex >= allModules.length - 1 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-slate-100 hover:bg-emerald-600'}`}
                title="Go to next module"
              >
                Next Module
              </button>

            {module.completed && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Module Info */}
          <div className="bg-slate-800 rounded-lg shadow p-8 mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">{module.title}</h1>
          <p className="text-slate-300 mb-6">{module.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>~2 hours</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Reading Material</span>
            </div>
            {module.labUrl && (
              <div className="flex items-center space-x-1">
                <Flask className="h-4 w-4" />
                <span>Hands-on Lab</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
          <div className="bg-slate-800 rounded-lg shadow mb-6">
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Content</span>
                </div>
              </button>
              
              {module.labUrl && (
                <button
                  onClick={() => setActiveTab('lab')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'lab'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Flask className="h-4 w-4" />
                    <span>Lab</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'test'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Test</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'content' && (
              <div className="prose max-w-none text-slate-200">
                <div dangerouslySetInnerHTML={{ __html: module.content.replace(/\n/g, '<br/>').replace(/```([^`]+)```/g, '<pre class="bg-slate-800 border border-slate-700 p-4 rounded"><code class="text-slate-200">$1</code></pre>').replace(/`([^`]+)`/g, '<code class="bg-slate-700 px-1 rounded text-slate-200">$1</code>').replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>').replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>').replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2 mt-4">$1</h3>').replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>').replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>') }} />
                
                {module.videoUrl && (
                  <div className="mt-8">
                    <h3 className="font-bold text-slate-100 mb-4">Video Lecture</h3>
                    <VideoPlayer
                      videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      title={`${module.title} - Video Lecture`}
                      onProgress={(progress) => console.log('Video progress:', progress)}
                      onComplete={() => console.log('Video completed')}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lab' && module.labUrl && (
              <div className="text-center py-8">
                <Flask className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-100 mb-4">Hands-on Lab</h3>
                <p className="text-slate-300 mb-6">
                  Practice what you've learned with interactive exercises and real-world scenarios.
                </p>
                <button className="bg-amber-600 text-slate-100 px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors">
                  Start Lab Environment
                </button>
              </div>
            )}

            {activeTab === 'test' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-100 mb-4">Module Test</h3>
                <p className="text-slate-300 mb-6">
                  Test your understanding of this module with a focused quiz.
                </p>
                {module.testScore ? (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Previous Score: {module.testScore}%
                    </span>
                  </div>
                ) : null}
                <button
                  onClick={() => setShowTest(true)}
                  className="bg-green-600 text-slate-100 px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {module.testScore ? 'Retake Test' : 'Take Test'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Complete Module Button or Certificate */}
        {!module.completed ? (
          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary">Ready to complete this module?</h3>
                <p className="text-muted">Take the test to mark this module as complete.</p>
              </div>
              <button
                onClick={() => setShowTest(true)}
                className="btn-primary text-slate-900 px-6 py-3 rounded-lg hover:opacity-95 transition-colors"
              >
                Take Module Test
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary">Module Completed!</h3>
                <p className="text-muted">You've successfully completed this module.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowTest(true)}
                  className="text-accent hover:text-accent-600 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Retake Test</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Section */}
        {course && isAllModulesCompleted(course) && (
          <div className="bg-card rounded-lg shadow-md p-6 mt-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Award className="h-12 w-12 text-accent" />
                <div>
                  <h3 className="font-bold text-primary">Course Completed!</h3>
                  <p className="text-muted">Congratulations! You've completed all modules.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* If we're on last module, show Complete Course button */}
                {currentIndex === allModules.length - 1 ? (
                  <button
                    onClick={completeCourseAndGenerateCertificate}
                    className="bg-emerald-600 text-slate-100 px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Award className="h-5 w-5" />
                    <span>Complete Course</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="btn-primary text-slate-900 px-6 py-3 rounded-lg hover:opacity-95 transition-colors flex items-center space-x-2"
                  >
                    <Award className="h-5 w-5" />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificate && course && user && (
          <CertificateModal
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
            courseName={course.title}
            studentName={user.name || 'Student'}
            completionDate={new Date()}
          />
        )}
      </div>
    </div>
  );
};