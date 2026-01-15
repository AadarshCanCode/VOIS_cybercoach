import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, FileText, FlaskRound as Flask, Award, Terminal, Lock } from 'lucide-react';
import { ModuleViewer } from './ModuleViewer';
import { courseService } from '@services/courseService';
import { VURegistrationModal } from './VURegistrationModal';
import type { Course, Module } from '@types';
import { useAuth } from '@context/AuthContext';

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

type ProgressRow = {
  module_id?: string;
  completed?: boolean | null;
  quiz_score?: number | null;
};

type CourseModuleLike = Module & {
  id: string;
  testScore?: number | null;
  videoUrl?: string | null;
  labUrl?: string | null;
  completed?: boolean;
};

export const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVURegistration, setShowVURegistration] = useState(false);
  const { user } = useAuth();


  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        // merge user progress if available
        if (mounted && data) {
          if (user?.id) {
            // Check for VU Registration
            if (data.category === 'vishwakarma-university') {
              const vuEmail = localStorage.getItem('vu_student_email');
              if (!vuEmail) {
                setShowVURegistration(true);
              }
            }

            try {
              const progress = await courseService.getUserProgress(user.id, courseId) as ProgressRow[] | null;
              const moduleProgress = (progress || []).reduce((acc: Record<string, ProgressRow>, p: ProgressRow) => {
                if (p.module_id) acc[p.module_id] = p;
                return acc;
              }, {});

              // normalize modules into course.modules for rendering
              const modules = (data.course_modules ?? data.modules ?? []) as CourseModuleLike[];
              const normalized = modules.map((m) => ({
                ...m,
                completed: !!moduleProgress[m.id]?.completed,
                testScore: (moduleProgress[m.id]?.quiz_score ?? m.testScore) ?? undefined
              }));

              setCourse({ ...data, modules: normalized });
            } catch (e) {
              console.error('Failed to load user progress for course detail:', e);
              setCourse(data);
            }
          } else {
            setCourse(data);
          }
        }
      } catch (e) {
        console.error('Failed to load course:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    // Listen for fallback navigation events from ModuleViewer
    const onNavigate = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (detail?.moduleId) setSelectedModuleId(detail.moduleId);
      } catch (err) {
        // ignore malformed events but log for debugging

        console.warn('navigateModule event parsing failed', err);
      }
    };

    window.addEventListener('navigateModule', onNavigate as EventListener);

    // If URL contains ?module=ID set it
    const params = new URLSearchParams(window.location.search);
    const qModule = params.get('module');
    if (qModule) setSelectedModuleId(qModule);

    return () => { mounted = false; window.removeEventListener('navigateModule', onNavigate as EventListener); };
  }, [courseId, user]);

  // helper to refresh course data (used by ModuleViewer after progress changes)
  const refreshCourse = async () => {
    try {
      const data = await courseService.getCourseById(courseId);
      if (data) {
        if (user?.id) {
          const progress = await courseService.getUserProgress(user.id, courseId) as ProgressRow[] | null;
          const moduleProgress = (progress || []).reduce((acc: Record<string, ProgressRow>, p: ProgressRow) => {
            if (p.module_id) acc[p.module_id] = p;
            return acc;
          }, {});

          const modules = (data.course_modules ?? data.modules ?? []) as CourseModuleLike[];
          const normalized = modules.map((m) => ({
            ...m,
            completed: !!moduleProgress[m.id]?.completed,
            testScore: (moduleProgress[m.id]?.quiz_score ?? m.testScore) ?? undefined
          }));

          setCourse({ ...data, modules: normalized });
        } else {
          setCourse(data);
        }
      }
    } catch (e) {
      console.error('Failed refreshing course:', e);
    }
  };

  if (loading) return (
    <div className="p-6 min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88] mx-auto mb-4"></div>
        <p className="text-[#00B37A] font-mono">LOADING MISSION DATA...</p>
      </div>
    </div>
  );
  if (!course) {
    return (
      <div className="p-6 min-h-screen bg-black">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Terminal className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-[#00B37A] mb-6">The requested training module does not exist.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:bg-[#00CC66] transition-colors"
          >
            Return to Courses
          </button>
        </div>
      </div>
    );
  }

  if (selectedModuleId) {
    return (
      <ModuleViewer
        courseId={courseId}
        moduleId={selectedModuleId}
        onBack={() => setSelectedModuleId(null)}
        onNavigateToModule={(id: string) => setSelectedModuleId(id)}
        onModuleStatusChange={refreshCourse}
      />
    );
  }

  const completedModules = (course.modules ?? course.course_modules ?? []).filter((m: Module) => m.completed).length;
  const totalModules = (course.modules ?? course.course_modules ?? []).length;
  const progressPercentage = (completedModules / totalModules) * 100;



  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[#00B37A] hover:text-[#00FF88] transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Courses</span>
          </button>
        </div>

        {/* Course Info */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
                    <Terminal className="h-6 w-6 text-[#00FF88]" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                </div>
                <p className="text-[#00B37A] text-lg mb-6">{course.description}</p>

                <div className="flex items-center flex-wrap gap-4 text-sm font-mono mb-6">
                  <div className="flex items-center space-x-2 text-[#EAEAEA]/60">
                    <FileText className="h-4 w-4 text-[#00FF88]" />
                    <span>{totalModules} MODULES</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#EAEAEA]/60">
                    <Clock className="h-4 w-4 text-[#00FF88]" />
                    <span>~{totalModules * 2} HOURS</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#EAEAEA]/60">
                    <Flask className="h-4 w-4 text-[#00FF88]" />
                    <span>HANDS-ON LABS</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#EAEAEA]/60">
                    <Award className="h-4 w-4 text-[#00FF88]" />
                    <span>CERTIFICATE</span>
                  </div>
                </div>

                {/* Intentional blank: mission objectives removed to avoid static content */}
              </div>

              <div className="space-y-6">
                {/* Progress Card */}
                <div className="bg-black/40 rounded-xl p-6 border border-[#00FF88]/10">
                  <h3 className="font-bold text-[#00B37A] mb-4 text-xs uppercase tracking-widest">Mission Progress</h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-[#00FF88] font-mono">{Math.round(progressPercentage)}%</div>
                    <div className="text-[#00B37A] text-sm">Complete</div>
                  </div>
                  <div className="w-full bg-black rounded-full h-2 mb-4 border border-[#00FF88]/10">
                    <div
                      className="bg-[#00FF88] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-[#00B37A] text-center font-mono">
                    {completedModules} / {totalModules} MODULES COMPLETED
                  </div>
                </div>

                {/* Intentional blank: quick stats with hardcoded values removed */}
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="border-b border-[#00FF88]/10 p-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-[#00FF88]" />
              <span>Training Modules</span>
            </h2>
          </div>

          <div className="divide-y divide-[#00FF88]/10">
            {(course.modules ?? course.course_modules ?? []).map((module: Module, index: number, array: any[]) => {
              // Sequential Locking: Admin always access, First module always access, Others need previous completed
              const isModuleUnlocked = user?.role === 'admin' || index === 0 || array[index - 1]?.completed;

              return (
                <div key={module.id} className="p-6 hover:bg-[#00FF88]/5 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {module.completed ? (
                          <div className="h-8 w-8 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-[#00FF88]" />
                          </div>
                        ) : isModuleUnlocked ? (
                          <div className="h-8 w-8 rounded-full border border-[#00FF88]/30 flex items-center justify-center group-hover:border-[#00FF88] transition-colors">
                            <span className="text-sm font-bold text-[#00B37A] font-mono">{String(index + 1).padStart(2, '0')}</span>
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-white/30" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-lg font-medium mb-1 ${isModuleUnlocked ? 'text-white group-hover:text-[#00FF88]' : 'text-white/30'} transition-colors`}>
                          {module.title}
                        </h3>
                        <p className={`mb-3 ${isModuleUnlocked ? 'text-[#00B37A]' : 'text-white/20'}`}>{module.description}</p>

                        <div className={`flex items-center space-x-4 text-sm ${isModuleUnlocked ? 'text-[#EAEAEA]/60' : 'text-white/20'}`}>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>Reading</span>
                          </div>
                          {module.videoUrl && (
                            <div className="flex items-center space-x-1">
                              <Play className="h-4 w-4" />
                              <span>Video</span>
                            </div>
                          )}
                          {module.labUrl && (
                            <div className="flex items-center space-x-1">
                              <Flask className="h-4 w-4" />
                              <span>Lab</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>~2 hours</span>
                          </div>
                        </div>

                        {module.testScore && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20">
                              Test Score: {module.testScore}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedModuleId(module.id)}
                      disabled={!isModuleUnlocked}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold transition-all ${isModuleUnlocked
                        ? 'bg-[#00FF88] text-black hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                        : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                      {isModuleUnlocked ? (
                        <>
                          <Play className="h-4 w-4" />
                          <span>{module.completed ? 'Review' : 'Start'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Locked</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <VURegistrationModal
        isOpen={showVURegistration}
        onClose={() => {
          // If they close without registering, they can't access, so maybe just force open or redirect back?
          // For now, let them see the course but if they click modules... actually logic above blocks it?
          // No, we are blocking access via the modal overlay primarily.
          // Let's redirect back if they cancel
          onBack();
        }}
        onSuccess={() => {
          setShowVURegistration(false);
          refreshCourse();
        }}
      />
    </div>
  );
};