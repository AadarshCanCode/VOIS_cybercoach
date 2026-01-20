import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { labs } from '@data/labs';
import { ArrowLeft, FileText, CheckCircle, Award, Terminal, Play, Shield } from 'lucide-react';
import { CertificateModal } from '../Certificates/CertificateModal';
import { courseService } from '@services/courseService';
import type { Module, Course } from '@types';
import { ModuleTest } from './ModuleTest';
import { ProctoringComponent } from '../Proctoring/ProctoringComponent';
import { learningPathService } from '../../../../shared/services/learningPathService';
import { useAuth } from '@context/AuthContext';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    primaryColor: '#00FF88',
    primaryTextColor: '#000000',
    primaryBorderColor: '#00FF88',
    lineColor: '#00FF88',
    secondaryColor: '#0a0f0a',
    tertiaryColor: '#00331b'
  }
});

interface ModuleViewerProps {
  courseId: string;
  moduleId: string;
  onBack: () => void;
  onNavigateToModule?: (moduleId: string) => void;
  onModuleStatusChange?: () => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({ courseId, moduleId, onBack, onNavigateToModule, onModuleStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'test'>('content');
  const [showTest, setShowTest] = useState(false);
  const { user } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [vuStudentDetails, setVuStudentDetails] = useState<any>(null);



  // Proctoring State
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  const handleProctoringViolation = async (status: 'ok' | 'violation') => {
    if (status === 'violation' && isProctoringActive) {
      // Determine max warnings based on module type
      const isFinalExam = moduleId === 'vu-final-exam';
      const maxWarnings = isFinalExam ? 1 : 0;

      if (violationCount < maxWarnings) {
        // Warning
        setViolationCount(prev => prev + 1);
        alert(`PROCTORING WARNING: Suspicious activity detected! You have ${maxWarnings - violationCount} warnings remaining.`);
      } else {
        // Lockout
        console.warn('Proctoring Violation - Locking out!');
        setIsProctoringActive(false);
        setShowTest(false);
        setViolationCount(0); // Reset for next valid attempt after lockout

        try {
          // Calculate lockout time (1 hour from now)
          const lockedUntil = new Date();
          lockedUntil.setHours(lockedUntil.getHours() + 1);

          const API_URL = import.meta.env.VITE_API_URL || '';
          const email = localStorage.getItem('vu_student_email');

          if (course?.category === 'vishwakarma-university' && email) {
            await fetch(`${API_URL}/api/vu/progress`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                vu_email: email,
                course_id: courseId,
                module_id: moduleId,
                locked_until: lockedUntil.toISOString()
              })
            });
            alert('PROCTORING VIOLATION: Test has been locked for 1 hour due to suspicious activity.');
            onBack();
          }
        } catch (e) {
          console.error('Lockout failed', e);
        }
      }
    }
  };

  useEffect(() => {
    if (showTest) {
      if (moduleId === 'vu-final-exam') {
        // Special start logic for Final Exam could go here
      }
      setViolationCount(0); // Reset count on start
      setIsProctoringActive(true);
    } else {
      setIsProctoringActive(false);
    }
  }, [showTest, moduleId]);



  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        if (mounted && data) {
          // VU Student Check
          if (data.category === 'vishwakarma-university') {
            const email = localStorage.getItem('vu_student_email');
            if (email) {
              const student = await courseService.getVUStudent(email);
              if (student) setVuStudentDetails(student);
            }
          }

          if (user?.id) {
            try {
              const progress = await courseService.getUserProgress(user.id, courseId) as any[] | null;
              const moduleProgress = (progress || []).reduce((acc: any, p: any) => {
                if (p.module_id) acc[p.module_id] = p;
                return acc;
              }, {});

              const modules = (data.course_modules ?? data.modules ?? []) as Module[];

              // Handle Final Exam Dynamic Questions
              const finalExamModule = modules.find(m => m.id === 'vu-final-exam');
              if (finalExamModule) {
                // Collect all questions from other modules
                const allQuestions = modules
                  .filter(m => m.id !== 'vu-final-exam')
                  .flatMap(m => m.questions || []);

                // Shuffle and pick 20
                const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
                finalExamModule.questions = shuffled.slice(0, 20);
                // Also assign testScore from progress if exists
                // finalExamModule.testScore = moduleProgress['vu-final-exam']?.quiz_score;
              }

              const normalized = modules.map((m) => ({
                ...m,
                completed: !!moduleProgress[m.id]?.completed,
                testScore: (moduleProgress[m.id]?.quiz_score ?? m.testScore) ?? undefined
              }));

              setCourse({ ...data, course_modules: normalized, modules: normalized });
            } catch (e) {
              console.error('Failed to load progress', e);
              setCourse(data);
            }
          } else {
            setCourse(data);
          }
        }
      } catch (e) {
        console.error('Failed to load course for module viewer:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [courseId, user?.id]);

  const module: Module | undefined = (course?.course_modules ?? course?.modules ?? []).find((m: Module) => m.id === moduleId);

  const isAllModulesCompleted = (course: Course) => {
    const modules = course.course_modules ?? course.modules ?? [];
    return modules.every((m: Module) => m.completed);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF88] mx-auto mb-4"></div>
          <p className="text-[#00FF88] font-mono">LOADING MODULE DATA...</p>
        </div>
      </div>
    );
  }
  if (!course || !module) {
    return (
      <div className="p-6 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Terminal className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-mono">ERROR: MODULE NOT FOUND</p>
          <button onClick={onBack} className="mt-4 text-[#00FF88] hover:underline">Return to Course</button>
        </div>
      </div>
    );
  }

  const allModules = course.course_modules ?? course.modules ?? [];
  const currentIndex = allModules.findIndex((m: Module) => m.id === moduleId);

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

  const markModuleCompleted = async (_skipTest = false) => {
    try {
      module.completed = true;
      setCourse({ ...course });

      if (user?.id) {
        await courseService.updateProgress(user.id, courseId, moduleId, true, module.testScore ?? undefined);
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

        for (const m of allModules) {
          await courseService.updateProgress(user.id, courseId, m.id, true, m.testScore ?? undefined);
        }

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
        await courseService.updateProgress(user.id, courseId, moduleId, true, score);
        await learningPathService.rebalance(user.id, courseId);
        if (onModuleStatusChange) onModuleStatusChange();
      }
    } catch (e) {
      console.error('Failed to persist progress or rebalance:', e);
    }
  };

  if (showTest) {
    return (
      <>
        <ModuleTest
          moduleId={moduleId}
          moduleTitle={module.title}
          onComplete={handleTestCompletion}
          onBack={() => setShowTest(false)}
          questions={module.questions || []}
        />
        <ProctoringComponent
          isActive={isProctoringActive}
          onStatusChange={handleProctoringViolation}
        />
      </>
    );
  }

  const processContent = (rawContent: string) => {
    let content = rawContent || '';

    // 0. Pre-process YouTube
    content = content.replace(
      /<a\s+(?:[^>]*?\s+)?href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&[\w%=]*)?["'][^>]*>.*?<\/a>/gi,
      (_match, videoId) => `<div class="aspect-video w-full my-8 bg-black/50 rounded-xl overflow-hidden border border-[#00FF88]/20 shadow-[0_0_20px_rgba(0,255,136,0.1)] group"><iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    );

    // 1. Headers & Lists (Markdown) - Relies on \n
    content = content
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 mt-6 text-white">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2 mt-4 text-[#00FF88]">$1</h3>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-[#00B37A] list-disc list-inside">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-[#00B37A] list-decimal list-inside">$2</li>');

    // 2. Code Blocks (Mermaid & Generic) - Tokenize to protect from <br/>
    const tokens: string[] = [];
    const saveToken = (text: string) => {
      tokens.push(text);
      return `__TOKEN_${tokens.length - 1}__`;
    };

    content = content.replace(/```mermaid([\s\S]*?)```/gi, (_match, code) => {
      return saveToken(`<div class="mermaid my-8 bg-[#0A0F0A] p-6 rounded-xl border border-[#00FF88]/20 flex justify-center overflow-x-auto shadow-[inset_0_0_20px_rgba(0,255,136,0.05)] text-left">${code.trim()}</div>`);
    });

    content = content.replace(/```([\s\S]*?)```/gi, (_match, code) => {
      return saveToken(`<pre class="bg-black border border-[#00FF88]/20 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-[#00FF88] font-mono">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    });

    // 3. Replace remaining Newlines
    content = content.replace(/\n/g, '<br/>');

    // 4. Restore tokens
    tokens.forEach((token, index) => {
      content = content.replace(`__TOKEN_${index}__`, token);
    });

    // 5. Inline Stylings (backticks)
    content = content.replace(/`([^`]+)`/g, '<code class="bg-black/50 px-1.5 py-0.5 rounded text-[#00FF88] font-mono">$1</code>');

    return content;
  };

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
              disabled={currentIndex < 0 || currentIndex >= allModules.length - 1 || (!module.completed && user?.role !== 'admin')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${currentIndex < 0 || currentIndex >= allModules.length - 1 || (!module.completed && user?.role !== 'admin') ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed' : 'bg-[#00B37A] text-black hover:bg-[#00FF88] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'}`}
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
                <FileText className="h-4 w-4 text-[#00FF88]" />
                <span>CONTENT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
          <div className="border-b border-[#00FF88]/10">
            <nav className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-3 px-6 rounded-lg font-medium text-sm transition-all ${activeTab === 'content'
                  ? 'bg-[#00FF88] text-black'
                  : 'text-[#00B37A] hover:text-[#00FF88] hover:bg-[#00FF88]/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Content</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('test')}
                className={`py-3 px-6 rounded-lg font-medium text-sm transition-all ${activeTab === 'test'
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
              <div
                className="prose max-w-none text-[#EAEAEA] module-content"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  // Handle Lab Launch Buttons
                  const labBtn = target.closest('[data-lesson-action="launch-lab"]');
                  if (labBtn) {
                    const labId = labBtn.getAttribute('data-lab-id');
                    if (labId) {
                      const lab = labs.find(l => l.id === labId);
                      if (lab && lab.liveUrl) {
                        window.open(lab.liveUrl, '_blank');
                      } else {
                        // Fallback to internal navigation if no URL (optional, or just do nothing)
                        const evt = new CustomEvent('navigateToTab', {
                          detail: { tab: 'labs', labId: labId }
                        });
                        window.dispatchEvent(evt);
                      }
                    }
                  }
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: processContent(module.content || '') }} />
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
            studentName={vuStudentDetails?.name || user.name || 'Student'}
            completionDate={new Date()}
            facultyName={vuStudentDetails?.faculty_name}
            isVU={!!vuStudentDetails}
          />
        )}


      </div>
      <ProctoringComponent
        isActive={isProctoringActive}
        onStatusChange={handleProctoringViolation}
      />
    </div>
  );
};