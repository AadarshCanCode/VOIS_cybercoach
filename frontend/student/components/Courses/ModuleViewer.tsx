import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, FlaskRound as Flask, CheckCircle, Clock, Award, Terminal, Play, Shield } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF88] mx-auto mb-4"></div>
          <p className="text-[#00FF88] font-mono">LOADING MODULE DATA...</p>
        </div>
      </div>
    );
  }
  if (!course || !module) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Terminal className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-mono">ERROR: MODULE NOT FOUND</p>
          <button onClick={onBack} className="mt-4 text-[#00FF88] hover:underline">Return to Course</button>
        </div>
      </div>
    );
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-[#EAEAEA]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[#00B37A] hover:text-[#00FF88] transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Course</span>
          </button>
          <div className="flex items-center space-x-4">
            {/* Mark as completed (manual) */}
            <button
              onClick={() => markModuleCompleted(true)}
              disabled={module.completed}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${module.completed ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 cursor-not-allowed' : 'bg-[#00FF88] text-black hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'}`}
              title="Mark this module as completed"
            >
              {module.completed ? '✓ Completed' : 'Mark Complete'}
            </button>

            {/* Go to next module */}
            <button
              onClick={goToNextModule}
              disabled={currentIndex < 0 || currentIndex >= allModules.length - 1}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${currentIndex < 0 || currentIndex >= allModules.length - 1 ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed' : 'bg-[#00B37A] text-black hover:bg-[#00FF88] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'}`}
              title="Go to next module"
            >
              <span>Next Module</span>
              <Play className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Module Info */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
                <Terminal className="h-6 w-6 text-[#00FF88]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{module.title}</h1>
                <p className="text-[#00B37A] text-sm font-mono">MODULE {String(currentIndex + 1).padStart(2, '0')} OF {String(allModules.length).padStart(2, '0')}</p>
              </div>
            </div>
            <p className="text-[#00B37A] mb-6">{module.description}</p>
          
            <div className="flex items-center flex-wrap gap-4 text-sm font-mono text-[#EAEAEA]/60">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#00FF88]" />
                <span>~2 HOURS</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-[#00FF88]" />
                <span>READING</span>
              </div>
              {module.videoUrl && (
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-[#00FF88]" />
                  <span>VIDEO</span>
                </div>
              )}
              {module.labUrl && (
                <div className="flex items-center space-x-2">
                  <Flask className="h-4 w-4 text-[#00FF88]" />
                  <span>HANDS-ON LAB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="border-b border-[#00FF88]/10">
            <nav className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'content'
                    ? 'bg-[#00FF88] text-black'
                    : 'text-[#00B37A] hover:text-[#00FF88] hover:bg-[#00FF88]/10'
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
                  className={`py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                    activeTab === 'lab'
                      ? 'bg-[#00FF88] text-black'
                      : 'text-[#00B37A] hover:text-[#00FF88] hover:bg-[#00FF88]/10'
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
                className={`py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'test'
                    ? 'bg-[#00FF88] text-black'
                    : 'text-[#00B37A] hover:text-[#00FF88] hover:bg-[#00FF88]/10'
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
              <div className="prose max-w-none text-[#EAEAEA]">
                <div dangerouslySetInnerHTML={{ __html: module.content.replace(/\n/g, '<br/>').replace(/```([^`]+)```/g, '<pre class="bg-black border border-[#00FF88]/20 p-4 rounded-lg"><code class="text-[#00FF88] font-mono">$1</code></pre>').replace(/`([^`]+)`/g, '<code class="bg-black/50 px-1.5 py-0.5 rounded text-[#00FF88] font-mono">$1</code>').replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>').replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 mt-6 text-white">$1</h2>').replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2 mt-4 text-[#00FF88]">$1</h3>').replace(/^- (.+)$/gm, '<li class="ml-4 text-[#00B37A]">$1</li>').replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-[#00B37A]">$2</li>') }} />
                
                {module.videoUrl && (
                  <div className="mt-8 bg-black/40 rounded-xl p-6 border border-[#00FF88]/10">
                    <h3 className="font-bold text-[#00FF88] mb-4 flex items-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Video Lecture</span>
                    </h3>
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
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Flask className="h-10 w-10 text-[#00FF88]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Hands-on Lab Environment</h3>
                <p className="text-[#00B37A] mb-6 max-w-md mx-auto">
                  Practice what you've learned with interactive exercises and real-world scenarios in a safe sandbox environment.
                </p>
                <button className="bg-[#00FF88] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
                  Launch Lab Environment
                </button>
              </div>
            )}

            {activeTab === 'test' && (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-[#00FF88]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Module Assessment</h3>
                <p className="text-[#00B37A] mb-6 max-w-md mx-auto">
                  Test your understanding of this module with a focused quiz to validate your knowledge.
                </p>
                {module.testScore && (
                  <div className="mb-6">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                      Previous Score: {module.testScore}%
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowTest(true)}
                  className="bg-[#00FF88] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
                >
                  {module.testScore ? 'Retake Test' : 'Start Test'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Complete Module Button or Certificate */}
        {!module.completed ? (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Ready to prove your skills?</h3>
                <p className="text-[#00B37A]">Take the assessment to complete this module.</p>
              </div>
              <button
                onClick={() => setShowTest(true)}
                className="bg-[#00FF88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
              >
                Take Module Test
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
                  <CheckCircle className="h-6 w-6 text-[#00FF88]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00FF88]">Module Completed!</h3>
                  <p className="text-[#00B37A]">You've successfully completed this training module.</p>
                </div>
              </div>
              <button
                onClick={() => setShowTest(true)}
                className="text-[#00B37A] hover:text-[#00FF88] transition-colors flex items-center space-x-2 border border-[#00FF88]/20 px-4 py-2 rounded-lg hover:bg-[#00FF88]/10"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Retake Test</span>
              </button>
            </div>
          </div>
        )}

        {/* Certificate Section */}
        {course && isAllModulesCompleted(course) && (
          <div className="bg-gradient-to-r from-[#0A0F0A] to-[#0A1A0A] rounded-xl border-2 border-[#00FF88]/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
                  <Award className="h-10 w-10 text-[#00FF88]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00FF88] text-lg">Mission Complete!</h3>
                  <p className="text-[#00B37A]">Congratulations, operative! You've completed all training modules.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* If we're on last module, show Complete Course button */}
                {currentIndex === allModules.length - 1 ? (
                  <button
                    onClick={completeCourseAndGenerateCertificate}
                    className="bg-[#00FF88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all flex items-center space-x-2"
                  >
                    <Award className="h-5 w-5" />
                    <span>Complete Course</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="bg-[#00FF88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all flex items-center space-x-2"
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