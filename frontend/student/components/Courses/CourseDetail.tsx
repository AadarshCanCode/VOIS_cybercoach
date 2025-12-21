import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, FileText, FlaskRound as Flask, Award } from 'lucide-react';
import { ModuleViewer } from './ModuleViewer';
import { courseService } from '@services/courseService';
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
            try {
              const progress = await courseService.getUserProgress(user.id, courseId) as ProgressRow[] | null;
              const moduleProgress = (progress || []).reduce((acc: Record<string, ProgressRow>, p: ProgressRow) => {
                if (p.module_id) acc[p.module_id] = p;
                return acc;
              }, {});

              // normalize modules into course.course_modules for rendering
              const modules = (data.course_modules ?? data.modules ?? []) as CourseModuleLike[];
              const normalized = modules.map((m) => ({
                ...m,
                completed: !!moduleProgress[m.id]?.completed,
                testScore: (moduleProgress[m.id]?.quiz_score ?? m.testScore) ?? undefined
              }));

              setCourse({ ...data, course_modules: normalized });
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

          setCourse({ ...data, course_modules: normalized });
        } else {
          setCourse(data);
        }
      }
    } catch (e) {
      console.error('Failed refreshing course:', e);
    }
  };

  if (loading) return <div className="p-6 text-primary">Loading course...</div>;
  if (!course) {
    return <div className="p-6 text-primary">Course not found</div>;
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

  const allowedModules = (() => {
    switch (user?.level) {
      case 'beginner':
        return 3;
      case 'intermediate':
        return 7;
      case 'advanced':
        return Number.POSITIVE_INFINITY;
      default:
        return 0;
    }
  })();

  return (
    <div className="p-6 bg-page min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Courses</span>
          </button>
        </div>

        {/* Course Info */}
  <div className="bg-card rounded-lg shadow p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-primary mb-4">{course.title}</h1>
              <p className="text-muted text-lg mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-muted mb-6">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{totalModules} Modules</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>~{totalModules * 2} hours</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flask className="h-4 w-4" />
                  <span>Hands-on Labs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Certificate</span>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4">
                <h3 className="font-bold text-primary mb-2">What You'll Learn</h3>
                <ul className="text-muted space-y-1">
                  <li>• Understand the OWASP Top 10 security vulnerabilities</li>
                  <li>• Learn practical exploitation techniques</li>
                  <li>• Master vulnerability prevention methods</li>
                  <li>• Gain hands-on experience with security tools</li>
                  <li>• Earn industry-recognized certification</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
                {/* Progress Card */}
              <div className="bg-card border border-card rounded-lg p-6">
                <h3 className="font-bold text-accent mb-4">Course Progress</h3>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-contrast">{Math.round(progressPercentage)}%</div>
                        <div className="text-muted">Complete</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 mb-4">
                    <div 
                      className="accent-amber h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                      <div className="text-sm text-accent text-center">
                    {completedModules} of {totalModules} modules completed
                  </div>
                </div>

              {/* Quick Stats */}
              <div className="bg-card border border-card rounded-lg p-6">
                <h3 className="font-bold text-primary mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted">Modules Completed</span>
                    <span className="font-medium">{completedModules}/{totalModules}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Labs Completed</span>
                    <span className="font-medium">2/6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Average Score</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Time Spent</span>
                    <span className="font-medium">12 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="bg-card rounded-lg shadow">
          <div className="border-b border-card p-6">
            <h2 className="text-xl font-bold text-primary">Course Modules</h2>
          </div>
          
          <div className="divide-y divide-card">
            {(course.modules ?? course.course_modules ?? []).map((module: Module, index: number) => (
              <div key={module.id} className="p-6 hover:bg-muted transition-colors rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {module.completed ? (
                        <CheckCircle className="h-6 w-6 text-accent" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-card flex items-center justify-center">
                          <span className="text-xs font-medium text-muted">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-primary mb-1">{module.title}</h3>
                      <p className="text-muted mb-3">{module.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted">
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-card text-accent">
                            Test Score: {module.testScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedModuleId(module.id)}
                    disabled={index >= allowedModules && user?.role !== 'admin'}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${index < allowedModules || user?.role === 'admin' ? 'btn-primary btn-primary-rounded' : 'bg-muted text-muted cursor-not-allowed'}`}
                  >
                    <Play className="h-4 w-4" />
                    <span>
                      {index < allowedModules || user?.role === 'admin' ? (module.completed ? 'Review' : 'Start') : 'Locked'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};