import React, { useEffect, useState } from 'react';
import { Lock, Play, CheckCircle, Clock, BookOpen, Terminal } from 'lucide-react';
import type { Course, Module, User } from '@types';
import { courseService } from '@services/courseService';
import { useAuth } from '@context/AuthContext';

interface CourseListProps {
  onCourseSelect: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const levelToAllowedModules = (level?: User['level']): number => {
    switch (level) {
      case 'beginner':
        return 3; // first 3 modules
      case 'intermediate':
        return 7; // first 7 modules
      case 'advanced':
        return Number.POSITIVE_INFINITY; // all modules
      default:
        return 0;
    }
  };

  const allowedCount = levelToAllowedModules(user?.level as User['level'] | undefined);
  const canAccessCourses = Boolean(user?.completedAssessment) || user?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await courseService.getAllCourses();
        if (mounted && Array.isArray(data)) setCourses(data);
      } catch (e) {
        console.error('Failed to load courses:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Training <span className="text-[#00FF88]">Modules</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">ACQUIRE NEW CAPABILITIES</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#00FF88]" />
          </div>
        </div>

        {/* Assessment notice */}
        {!canAccessCourses && (
          <div className="bg-[#0A0F0A] border border-yellow-500/20 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
            <div className="relative flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <Lock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-500 uppercase tracking-wider">Access Restricted</h3>
                <p className="text-yellow-500/80 text-sm mt-1">
                  Complete the initial assessment to unlock classified training modules.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Course list */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center text-[#00B37A] font-mono animate-pulse">INITIALIZING TRAINING DATA...</div>
          ) : (
            courses.map((course: Course) => {
              const isUnlocked = canAccessCourses;
              const progress = course.progress ?? 0;

              return (
                <div
                  key={course.id}
                  className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden group hover:border-[#00FF88]/30 transition-all duration-300 relative"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/0 via-[#00FF88]/0 to-[#00FF88]/0 group-hover:via-[#00FF88]/5 transition-all duration-500" />

                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-white tracking-tight">{course.title}</h2>
                          {isUnlocked ? (
                            <div className="px-2 py-0.5 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-bold uppercase tracking-wider">
                              Unlocked
                            </div>
                          ) : (
                            <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                              Locked
                            </div>
                          )}
                        </div>
                        <p className="text-[#00B37A] mb-6 max-w-2xl">{course.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-[#EAEAEA]/60 font-mono">
                          <div className="flex items-center space-x-2">
                            <Terminal className="h-4 w-4 text-[#00FF88]" />
                            <span>{(course.modules ?? course.course_modules ?? []).length} MODULES</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-[#00FF88]" />
                            <span>~{((course.modules ?? course.course_modules ?? []).length) * 2} HOURS</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => isUnlocked && onCourseSelect(course.id)}
                        disabled={!isUnlocked}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${isUnlocked
                          ? 'bg-[#00FF88] text-black hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                          : 'bg-[#0A0F0A] border border-white/10 text-white/20 cursor-not-allowed'
                          }`}
                      >
                        {isUnlocked ? <Play className="h-4 w-4 fill-current" /> : <Lock className="h-4 w-4" />}
                        <span>{isUnlocked ? 'START MISSION' : 'LOCKED'}</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {isUnlocked && (
                      <div className="mb-6">
                        <div className="flex justify-between text-xs text-[#00B37A] mb-2 font-mono uppercase tracking-wider">
                          <span>Mission Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-black rounded-full h-1.5 border border-[#00FF88]/10">
                          <div
                            className="bg-[#00FF88] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Module Preview */}
                    <div className="border-t border-[#00FF88]/10 pt-6">
                      <h3 className="text-xs font-bold text-[#00B37A] uppercase tracking-widest mb-4">Module Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(course.modules ?? course.course_modules ?? []).slice(0, 6).map((module: Module, index: number) => {
                          const moduleUnlocked = (index < allowedCount && canAccessCourses) || user?.role === 'admin';
                          return (
                            <div key={module.id} className="flex items-center space-x-3 text-sm group/module">
                              {moduleUnlocked ? (
                                module.completed ? (
                                  <CheckCircle className="h-4 w-4 text-[#00FF88]" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-[#00FF88]/30 group-hover/module:border-[#00FF88] transition-colors"></div>
                                )
                              ) : (
                                <Lock className="h-4 w-4 text-white/20" />
                              )}

                              <span className={`${moduleUnlocked ? 'text-[#EAEAEA] group-hover/module:text-[#00FF88]' : 'text-white/20'} transition-colors`}>
                                <span className="font-mono text-[#00B37A] mr-2">0{index + 1}</span>
                                {module.title.split(' – ')[1] || module.title}
                              </span>
                            </div>
                          );
                        })}

                        {course.modules && course.modules.length > 6 && (
                          <div className="text-xs text-[#00B37A] font-mono col-span-2 mt-2">
                            +{course.modules.length - 6} ADDITIONAL MODULES CLASSIFIED...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
