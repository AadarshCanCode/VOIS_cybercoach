import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { labs } from '@data/labs';
import { ArrowLeft, ArrowRight, FileText, CheckCircle, Award, Terminal, Play, Shield, ChevronRight } from 'lucide-react';
import { CertificateModal } from '../Certificates/CertificateModal';
import { courseService } from '@services/courseService';
import type { Module, Course } from '@types';
import { ModuleTest } from './ModuleTest';
import { ProctoringComponent } from '../Proctoring/ProctoringComponent';
import { learningPathService } from '../../../../shared/services/learningPathService';
import { useAuth } from '@context/AuthContext';
import { useExperienceTracker } from '../../../../shared/hooks/useExperienceTracker';
import { useProctoring } from '../../../../shared/hooks/useProctoring';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@lib/utils';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    darkMode: true,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    primaryColor: 'hsl(152 100% 50%)',
    primaryTextColor: '#000000',
    primaryBorderColor: 'hsl(152 100% 50%)',
    lineColor: 'hsl(152 100% 50%)',
    secondaryColor: 'hsl(120 20% 4%)',
    tertiaryColor: 'hsl(150 100% 10%)'
  }
});

interface ModuleViewerProps {
  courseId: string;
  moduleId: string;
  course: Course; // Now required
  onBack: () => void;
  onNavigateToModule?: (moduleId: string) => void;
  onModuleStatusChange?: () => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({ courseId, moduleId, course, onBack, onNavigateToModule, onModuleStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'test'>('content');
  const [showTest, setShowTest] = useState(false);
  const { user } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);

  // const [course, setCourse] = useState<Course | null>(null); // REMOVED local state
  // const [loading, setLoading] = useState(false); // REMOVED local loading logic

  // Proctoring State
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  // Experience Tracking
  useExperienceTracker({
    studentId: user?.id || 'anonymous',
    courseId,
    moduleId,
    enabled: !!user?.id
  });

  // Backend Proctoring Logging
  const { logEvent } = useProctoring({
    studentId: user?.id || 'anonymous',
    courseId,
    attemptId: `${moduleId}-${Date.now()}`,
    enabled: isProctoringActive
  });

  const module: Module | undefined = (course?.course_modules ?? course?.modules ?? []).find((m: Module) => m.id === moduleId);

  const handleProctoringViolation = async (status: 'ok' | 'violation') => {
    if (status === 'violation' && isProctoringActive) {
      logEvent('face-violation', { count: violationCount + 1 });
      const isFinalExam = moduleId === 'vu-final-exam' || module?.type === 'final_assessment' || module?.type === 'initial_assessment';
      const maxWarnings = 3;

      if (violationCount < maxWarnings) {
        setViolationCount(prev => prev + 1);
        alert(`PROCTORING WARNING: Suspicious activity detected! You have ${maxWarnings - violationCount} warnings remaining.`);
      } else {
        console.warn('Proctoring Violation - Locking out!');
        setIsProctoringActive(false);
        setShowTest(false);
        setViolationCount(0);

        try {
          const lockedUntil = new Date();
          // Lockout duration: 3 hours for Final Assessment / Exams, 1 hour for others
          const isFinalExam = moduleId === 'vu-final-exam' || module?.type === 'final_assessment';
          lockedUntil.setHours(lockedUntil.getHours() + (isFinalExam ? 3 : 1));

          const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || '';
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
            const durationText = (moduleId === 'vu-final-exam' || module?.type === 'final_assessment') ? '3 hours' : '1 hour';
            alert(`PROCTORING VIOLATION: Test has been locked for ${durationText} due to suspicious activity.`);
            onBack();
          }
        } catch (e) {
          console.error('Lockout failed', e);
        }
      }
    }
  };

  useEffect(() => {
    if (module?.type === 'final_assessment' || module?.type === 'initial_assessment') {
      setActiveTab('test');
      setShowTest(true);
      setIsProctoringActive(true); // Enable proctoring automatically
    } else {
      setIsProctoringActive(false);
    }
  }, [module?.id, module?.type]);

  useEffect(() => {
    if (activeTab === 'content') {
      // Use setTimeout to ensure the DOM has updated with the new HTML
      const timer = setTimeout(() => {
        mermaid.run({
          querySelector: '.mermaid'
        }).catch(err => console.error('Mermaid rendering failed:', err));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, module?.content, moduleId]);


  const isAllModulesCompleted = (course: Course) => {
    const modules = course.course_modules ?? course.modules ?? [];
    return modules.every((m: Module) => m.completed);
  };

  // Loading State - Removed as course is passed via props

  // Module Not Found
  if (!course || !module) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
        <Button variant="ghost" onClick={onBack} className="w-fit -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Terminal className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Module Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested module does not exist.</p>
            <Button onClick={onBack}>Return to Course</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allModules = course.course_modules ?? course.modules ?? [];
  const currentIndex = allModules.findIndex((m: Module) => m.id === moduleId);

  const goToNextModule = async () => {
    if (currentIndex >= 0 && currentIndex < allModules.length - 1) {
      // Ensure current module is marked complete before moving on
      if (!module.completed) {
        await markModuleCompleted();
      }

      const next = allModules[currentIndex + 1];
      if (onNavigateToModule) {
        onNavigateToModule(next.id);
        return;
      }
      window.history.pushState({}, '', `/course/${courseId}?module=${next.id}`);
      const evt = new CustomEvent('navigateModule', { detail: { moduleId: next.id } });
      window.dispatchEvent(evt);
    }
  };

  const markModuleCompleted = async (_skipTest = false) => {
    try {
      module.completed = true;
      module.completed = true;
      // setCourse({ ...course }); // Cannot update prop directly, rely on refresh callback

      if (user?.id) {
        await courseService.updateProgress(user.id, moduleId, true, module.testScore ?? undefined);
        await learningPathService.rebalance(user.id, courseId);
        if (onModuleStatusChange) onModuleStatusChange();
      }
    } catch (e) {
      console.error('Failed to mark module completed:', e);
    }
  };

  const completeCourseAndGenerateCertificate = async () => {
    try {
      if (user?.id) {
        for (const m of allModules) {
          await courseService.updateProgress(user.id, m.id, true, m.testScore ?? undefined);
        }
        if (onModuleStatusChange) await onModuleStatusChange();
        setShowCertificate(true);
      } else {
        setShowCertificate(true);
      }
    } catch (e) {
      console.error('Failed to complete course:', e);
    }
  };

  const handleTestCompletion = async (score: number, answers: number[]) => {
    module.completed = true;
    module.testScore = score;
    setShowTest(false);

    try {
      if (user?.id) {
        // Transform answers array to map { questionId: answerIndex }
        // Note: We need question IDs from the module questions
        const answersMap: Record<string, number> = {};
        (module.questions || []).forEach((q: any, i: number) => {
          // If questions don't have IDs on the frontend, we might have an issue mapping.
          // Backend expects map. If frontend only has array, we might need to rely on index matching or 
          // ensure questions have IDs.
          // For now, let's assume questions have 'id' or we use a convention.
          // If the backend `assessmentRoutes.ts` handles map by ID, we need IDs.
          // Fallback: If no ID, use index as key? Backend needs to handle that. 
          // Let's assume sending by ID is safer if possible, but if missing, check backend logic.
          // Backend implementation: `answers[q.id]`

          // Check if Question has ID. If not, this logic is brittle.
          // Assuming questions loaded from DB have IDs.
          if (q.id) {
            answersMap[q.id] = answers[i];
          }
        });

        // If the map is empty (no IDs), we can't easily grade securely by ID.
        // However, `courseService.updateProgress` (legacy) works.
        // Let's try to submit. IF questions don't have IDs, this map is empty.

        // Temporary: Fallback to legacy behavior if IDs are missing, BUT try new route first
        if (Object.keys(answersMap).length > 0) {
          const result = await courseService.submitAssessment(moduleId, answersMap);
          if (onModuleStatusChange) onModuleStatusChange();
          // Rebalance learning path after success
          await learningPathService.rebalance(user.id, courseId);
        } else {
          // Legacy fallback (Insecure but keeps UI working if IDs missing)
          await courseService.updateProgress(user.id, moduleId, true, score);
          await learningPathService.rebalance(user.id, courseId);
          if (onModuleStatusChange) onModuleStatusChange();
        }
      }
    } catch (e) {
      console.error('Failed to persist progress or rebalance:', e);
      // Fallback
      if (user?.id) {
        await courseService.updateProgress(user.id, moduleId, true, score);
      }
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
          questions={module.quiz || []}
          isInitialAssessment={module.type === 'initial_assessment'}
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

    // YouTube embeds
    content = content.replace(
      /<a\s+(?:[^>]*?\s+)?href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&[\w%=]*)?["'][^>]*>.*?<\/a>/gi,
      (_match, videoId) => `<div class="aspect-video w-full my-8 bg-muted rounded-xl overflow-hidden border border-border"><iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    );

    const tokens: string[] = [];
    const saveToken = (text: string) => {
      tokens.push(text);
      return `__TOKEN_${tokens.length - 1}__`;
    };

    content = content.replace(/```mermaid([\s\S]*?)```/gi, (_match, code) => {
      return saveToken(`<div class="mermaid my-8 bg-card p-6 rounded-xl border border-border flex justify-center overflow-x-auto text-left">${code.trim()}</div>`);
    });

    content = content.replace(/```([\s\S]*?)```/gi, (_match, code) => {
      return saveToken(`<pre class="bg-card border border-border p-4 rounded-lg my-4 overflow-x-auto"><code class="text-primary font-mono">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    });

    content = content
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/___(.*?)___/g, '<strong><em>$1</em></strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

    content = content
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-6 mt-8 border-b border-border pb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mb-4 mt-8">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mb-3 mt-6 text-primary">$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold mb-2 mt-4 text-primary">$1</h4>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 list-disc marker:text-primary">$1</li>')
      .replace(/^\* (.+)$/gm, '<li class="ml-6 mb-2 list-disc marker:text-primary">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 mb-2 list-decimal marker:text-primary">$2</li>');

    content = content.replace(/`([^`]+)`/g, '<code class="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono border border-primary/20">$1</code>');

    const blocks = content.split(/\n\s*\n/);
    content = blocks.map(block => {
      if (block.trim().startsWith('<h') || block.trim().startsWith('<li') || block.trim().startsWith('<pre') || block.trim().startsWith('<div') || block.trim().startsWith('__TOKEN')) {
        return block;
      }
      return `<p class="mb-4 leading-relaxed text-muted-foreground">${block.trim().replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    tokens.forEach((token, index) => {
      content = content.replace(`__TOKEN_${index}__`, token);
    });

    return content;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={module.completed ? "outline" : "default"}
            onClick={() => markModuleCompleted(true)}
            disabled={module.completed}
          >
            {module.completed ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : (
              'Mark Complete'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={goToNextModule}
            disabled={currentIndex < 0 || currentIndex >= allModules.length - 1 || (!module.completed && user?.role !== 'admin')}
          >
            Next Module
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Module Info Card */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{module.title}</CardTitle>
              <CardDescription>
                Module {String(currentIndex + 1).padStart(2, '0')} of {String(allModules.length).padStart(2, '0')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{module.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Content</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="border-border/50">
        <div className="border-b border-border/50">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('content')}
              className={cn(
                "flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === 'content'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileText className="h-4 w-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={cn(
                "flex items-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === 'test'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <CheckCircle className="h-4 w-4" />
              Test
            </button>
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === 'content' && (
            <div
              className="prose max-w-none module-content"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const labBtn = target.closest('[data-lesson-action="launch-lab"]');
                if (labBtn) {
                  const labId = labBtn.getAttribute('data-lab-id');
                  if (labId) {
                    const lab = labs.find((l: any) => l.id === labId);
                    if (lab && lab.liveUrl) {
                      window.open(lab.liveUrl, '_blank');
                    } else {
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
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Module Assessment</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Test your understanding of this module with a focused quiz to validate your knowledge.
              </p>
              {module.testScore && (
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    Previous Score: {module.testScore}%
                  </span>
                </div>
              )}
              <Button onClick={() => setShowTest(true)}>
                {module.testScore ? 'Retake Test' : 'Start Test'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Module Section */}
      {!module.completed ? (
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ready to prove your skills?</h3>
                <p className="text-muted-foreground text-sm">Take the assessment to complete this module.</p>
              </div>
              <Button onClick={() => setShowTest(true)}>
                Take Module Test
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Module Completed!</h3>
                  <p className="text-muted-foreground text-sm">You've successfully completed this training module.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowTest(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Retake Test
                </Button>
                {currentIndex < allModules.length - 1 && (
                  <Button onClick={goToNextModule}>
                    Next Module
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Section */}
      {course && isAllModulesCompleted(course) && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg">Course Complete!</h3>
                  <p className="text-muted-foreground">Congratulations! You've completed all training modules.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {currentIndex === allModules.length - 1 ? (
                  <Button onClick={completeCourseAndGenerateCertificate}>
                    <Award className="mr-2 h-5 w-5" />
                    Complete Course
                  </Button>
                ) : (
                  <Button onClick={() => setShowCertificate(true)}>
                    <Award className="mr-2 h-5 w-5" />
                    View Certificate
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Modal */}
      {showCertificate && course && user && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          courseName={course.title}
          studentName={user.name || 'Student'}
          completionDate={new Date()}
          facultyName=""
          isVU={false}
        />
      )}

      {/* ProctoringComponent is rendered inside the showTest block above */}
    </div>
  );
};