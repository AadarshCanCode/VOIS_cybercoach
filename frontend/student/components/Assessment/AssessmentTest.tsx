import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Camera, Mic, Video, ArrowRight, Bot } from 'lucide-react';
import { assessmentQuestions } from '@data/assessmentQuestions';
import { useAuth } from '@context/AuthContext';
// import types from '@types' (none needed here)
import { supabase } from '@lib/supabase';
import { assessmentService } from '@services/assessmentService';
import { ragService } from '@services/ragService';
import { learningPathService } from '@services/learningPathService';
import { courseService } from '@services/courseService';
import Proctoring from './Proctoring';
import ViolationNotification from './ViolationNotification';
import ExamTerminationModal from './ExamTerminationModal';

export const AssessmentTest: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string>('');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [violations, setViolations] = useState(0);
  const [lastViolationReason, setLastViolationReason] = useState<string>('');
  const [violationReasons, setViolationReasons] = useState<string[]>([]);
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, updateUser } = useAuth();

  const currentQuestion = assessmentQuestions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0 && !showResults && permissionGranted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && permissionGranted) {
      handleSubmitTest();
    }
  }, [timeLeft, showResults, permissionGranted]);

  // block copy/paste/right-click during assessment
  useEffect(() => {
    if (!permissionGranted || showResults) return;

    const onContext = (e: MouseEvent) => {
      e.preventDefault();
    };
    const onCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      // block Ctrl/Meta + C/V/X and Ctrl/Meta+S
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 's', 'p'].includes((e.key || '').toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', onContext);
    document.addEventListener('copy', onCopyCutPaste);
    document.addEventListener('cut', onCopyCutPaste);
    document.addEventListener('paste', onCopyCutPaste);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('copy', onCopyCutPaste);
      document.removeEventListener('cut', onCopyCutPaste);
      document.removeEventListener('paste', onCopyCutPaste);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [permissionGranted, showResults]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const requestMediaPermissions = async () => {
    setIsRequestingPermission(true);
    setPermissionError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setMediaStream(stream);
      setPermissionGranted(true);
      setIsRequestingPermission(false);
      // Start an assessment attempt once proctoring is active
      if (user?.id && !attemptId) {
        try {
          const attempt = await assessmentService.startAttempt(user.id, 'initial');
          setAttemptId(attempt.id);
        } catch (e: unknown) {
          console.error(e);
          setPermissionError('Could not start assessment attempt. Please retry.');
        }
      }
    } catch (error) {
      setIsRequestingPermission(false);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionError('Camera and microphone access denied. Please allow access to continue with the assessment.');
        } else if (error.name === 'NotFoundError') {
          setPermissionError('No camera or microphone found. Please ensure your devices are connected.');
        } else {
          setPermissionError('Failed to access camera and microphone. Please check your device settings.');
        }
      }
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    // Reset confidence to middle when selecting new answer
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer !== null) {
      // Save response to database
      await saveAssessmentResponse();

      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);

      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(answers[currentQuestionIndex + 1] ?? null);
        setQuestionStartTime(new Date()); // Reset timer for next question
      } else {
        // Pass false because we just saved it and updated state locally above (or logically should)
        // Actually, let's keep it simple: if we are at the last question, just submit.
        // But wait, if we just saved, we don't need to save again in handleSubmitTest
        await handleSubmitTest(newAnswers, false);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newAnswers = [...answers];
      if (selectedAnswer !== null) {
        newAnswers[currentQuestionIndex] = selectedAnswer;
        setAnswers(newAnswers);
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
    }
  };

  const handleSubmitTest = async (finalAnswers = answers, saveCurrent = true) => {
    // called when exam ends (manual or proctoring)

    // Save final response if not already saved and we have a selection
    if (saveCurrent && selectedAnswer !== null) {
      await saveAssessmentResponse();
      // Update finalAnswers to include this last one if it wasn't already there
      // (This covers the case where auto-submit happens while user has an answer selected but hasn't clicked next)
      finalAnswers[currentQuestionIndex] = selectedAnswer;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const score = calculateScore(finalAnswers);
      const level = determineLevel(score);

      // Read responses for this attempt and run analysis
      let analysis;
      if (attemptId) {
        const results = await assessmentService.getAttemptResults(attemptId);
        analysis = await ragService.analyzeAssessment(results);
      }

      // Persist user level + completion
      if (user?.id) {
        await supabase.from('users').update({ level, completed_assessment: true }).eq('id', user.id);
        updateUser({ completedAssessment: true, level });
      } else {
        updateUser({ completedAssessment: true, level });
      }

      // Allocate initial path if possible — use first published course from DB
      if (user?.id && analysis) {
        try {
          const published = await courseService.getAllCourses();
          const firstCourseId = Array.isArray(published) && published.length > 0 ? published[0].id : null;
          if (firstCourseId) {
            await learningPathService.allocateInitialPath(user.id, firstCourseId, analysis);
          }
        } catch (err) {
          console.error('Failed to allocate initial path from DB:', err);
        }
      }

      setShowResults(true);
    } catch (e: unknown) {
      console.error('Submit test failed:', e);
      const msg = e instanceof Error ? e.message : 'Submission failed.';
      setSubmitError(msg);
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProctorViolation = (count: number, reason: string) => {
    setViolations(count);
    setLastViolationReason(reason);
    setViolationReasons(prev => [...prev, reason]);
    console.warn('Proctor violation', count, reason);
  };

  const handleProctorViolationWarning = (reason: string, count: number, threshold: number) => {
    setLastViolationReason(reason);
    console.log(`Violation warning: ${reason} (${count}/${threshold})`);
  };

  const handleProctorEndExam = () => {
    setShowTerminationModal(true);

    // force submit and stop media
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }
    // ensure we submit
    handleSubmitTest(undefined, true);
  };

  const calculateScore = (userAnswers: number[]) => {
    let correct = 0;
    assessmentQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / assessmentQuestions.length) * 100);
  };

  const determineLevel = (score: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (score < 30) return 'beginner';
    if (score < 60) return 'intermediate';
    return 'advanced';
  };



  const saveAssessmentResponse = async () => {
    if (!user || selectedAnswer === null) return;

    try {
      const timeTaken = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      return await supabase.from('assessment_responses').insert({
        attempt_id: attemptId ?? undefined,
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        context: 'initial'
      });
    } catch (error) {
      console.error('Failed to save assessment response:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!permissionGranted) {
    return (
      <div className="p-6 min-h-[calc(100vh-4rem)] bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0A0F0A]/80 backdrop-blur-xl border border-[#00FF88]/10 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(0,255,136,0.05)]">
            <div className="mb-6">
              <div className="h-20 w-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00FF88]/20">
                <Video className="h-10 w-10 text-[#00FF88]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Security Clearance Required</h2>
              <p className="text-[#00B37A] mb-8 text-lg leading-relaxed">
                To maintain assessment integrity and secure testing protocols, we require active monitoring of your workstation.
              </p>
            </div>

            {permissionError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
                <p className="text-red-400 font-medium">{permissionError}</p>
              </div>
            )}

            <div className="bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-[#00FF88] mb-4 uppercase tracking-widest text-xs">Tactical Monitoring:</h3>
              <div className="space-y-4 text-[#EAEAEA]">
                <div className="flex items-start space-x-3">
                  <Camera className="h-5 w-5 mt-0.5 text-[#00FF88] flex-shrink-0" />
                  <span className="text-sm">Active Visual Identification (Face Detection)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Mic className="h-5 w-5 mt-0.5 text-[#00FF88] flex-shrink-0" />
                  <span className="text-sm">Audio Security Layer Persistence</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-8">
              <p className="text-blue-400 text-xs">
                <strong className="text-blue-300">Privacy Protocol:</strong> Visual and auditory feeds are processed locally for proctoring analysis and are not persisted to persistent storage.
              </p>
            </div>

            <button
              onClick={requestMediaPermissions}
              disabled={isRequestingPermission}
              className="w-full bg-[#00FF88] text-black px-8 py-4 rounded-xl hover:bg-[#00CC66] transition-all duration-300 text-lg font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)]"
            >
              {isRequestingPermission ? 'ESTABLISHING LINK...' : 'INITIATE SECURITY CLEARANCE'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.completedAssessment && !showResults) {
    return (
      <div className="p-6 min-h-screen bg-black">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/20 p-8">
            <CheckCircle className="h-16 w-16 text-[#00FF88] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Assessment Already Completed</h2>
            <p className="text-[#00B37A] mb-2">
              You have already completed the assessment test.
            </p>
            <p className="text-[#EAEAEA] mb-6">
              Your current level: <span className="font-bold text-[#00FF88] uppercase">{user.level}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'courses' } }));
                }}
                className="bg-[#00FF88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00CC66] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'dashboard' } }));
                }}
                className="border border-[#00FF88]/30 text-[#00FF88] px-6 py-3 rounded-lg hover:bg-[#00FF88]/10 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore(answers);
    const level = determineLevel(score);

    return (
      <div className="p-6 min-h-[calc(100vh-4rem)] bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0A0F0A]/80 backdrop-blur-xl border border-[#00FF88]/20 rounded-2xl p-8 text-center mb-8 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            <div className="mb-6">
              {score >= 85 ? (
                <CheckCircle className="h-20 w-20 text-[#00FF88] mx-auto animate-pulse" />
              ) : score >= 65 ? (
                <AlertCircle className="h-20 w-20 text-yellow-500 mx-auto" />
              ) : (
                <XCircle className="h-20 w-20 text-red-500 mx-auto" />
              )}
            </div>

            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Evaluation Terminated</h2>
            <p className="text-[#00B37A] text-lg font-mono mb-8 uppercase tracking-[0.3em]">Neural Link Score Analysis</p>

            <div className="text-8xl font-black text-[#00FF88] mb-8 tabular-nums drop-shadow-[0_0_20px_rgba(0,255,136,0.3)]">{score}%</div>

            <p className="text-xl text-[#EAEAEA] mb-12">
              Cybersecurity Clearance: <span className="font-bold uppercase text-[#00FF88] tracking-widest bg-[#00FF88]/10 px-4 py-1 rounded-full border border-[#00FF88]/20 ml-2">{level}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-[#00FF88]/30 transition-all">
                <div className="text-3xl font-black text-white group-hover:text-[#00FF88] transition-colors">{answers.filter((answer, index) => answer === assessmentQuestions[index].correctAnswer).length}</div>
                <div className="text-[#00B37A] text-xs uppercase font-mono mt-2 tracking-widest">Valid Signals</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-red-500/30 transition-all">
                <div className="text-3xl font-black text-white group-hover:text-red-400 transition-colors">{assessmentQuestions.length - answers.filter((answer, index) => answer === assessmentQuestions[index].correctAnswer).length}</div>
                <div className="text-[#00B37A] text-xs uppercase font-mono mt-2 tracking-widest">Neural Noise</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-blue-500/30 transition-all">
                <div className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{assessmentQuestions.length}</div>
                <div className="text-[#00B37A] text-xs uppercase font-mono mt-2 tracking-widest">Total Nodes</div>
              </div>
            </div>

            <div className="bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-2xl p-8 mb-12 text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot className="h-24 w-24 text-[#00FF88]" />
              </div>
              <h3 className="font-black text-[#00FF88] mb-4 uppercase tracking-widest">System Recommendation</h3>
              <p className="text-[#EAEAEA] leading-relaxed relative z-10">
                Evaluation complete. Based on your neural patterns, we've optimized your learning trajectory.
                Appropriate tactical modules have been unlocked in your dashboard.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-12 text-red-400 font-mono text-sm uppercase">{submitError}</div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'courses' } }));
                  // Not reloading if possible, but keep original logic if crucial
                }}
                disabled={submitting}
                className="bg-[#00FF88] text-black px-10 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-[#00CC66] transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(0,255,136,0.2)]"
              >
                <span>{submitting ? 'CALIBRATING...' : 'ACCESS MODULES'}</span>
                <ArrowRight className="h-6 w-6" />
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'dashboard' } }))}
                disabled={submitting}
                className="border border-white/20 text-white px-10 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-white/5 transition-all text-lg disabled:opacity-50"
              >
                COMMAND CENTER
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-[#0A0F0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest border-b border-white/5 pb-4">Neurometric Breakdown</h3>
            <div className="space-y-6">
              {assessmentQuestions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className={`border rounded-2xl p-6 transition-all duration-300 ${isCorrect
                    ? 'border-[#00FF88]/10 bg-[#00FF88]/5 hover:border-[#00FF88]/30'
                    : 'border-red-500/10 bg-red-500/5 hover:border-red-500/30'
                    }`}>
                    <div className="flex items-start space-x-4">
                      {isCorrect ? (
                        <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-[#00FF88]" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <XCircle className="h-6 w-6 text-red-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-lg font-bold text-white mb-4 leading-snug">{question.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-[#00FF88]/10 border-[#00FF88]/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 block mb-1">Your Protocol</span>
                            <span className={`font-bold ${isCorrect ? 'text-[#00FF88]' : 'text-red-400'}`}>{question.options[userAnswer]}</span>
                          </div>
                          {!isCorrect && (
                            <div className="p-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20">
                              <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 block mb-1">Optimal Protocol</span>
                              <span className="font-bold text-[#00FF88]">{question.options[question.correctAnswer]}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 block mb-2">Tactical Explanation</span>
                          <p className="text-sm text-[#00B37A] italic leading-relaxed">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-[calc(100vh-4rem)] bg-black">
      {/* Violation Notification */}
      <ViolationNotification
        violations={violations}
        threshold={3}
        lastViolationReason={lastViolationReason}
      />

      {/* Exam Termination Modal */}
      <ExamTerminationModal
        isOpen={showTerminationModal}
        violations={violations}
        threshold={3}
        violationReasons={violationReasons}
        onClose={() => setShowTerminationModal(false)}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0A0F0A]/80 backdrop-blur-xl border border-[#00FF88]/10 rounded-2xl p-5 sticky top-24 shadow-[0_0_30px_rgba(0,255,136,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-mono text-[#00B37A] tracking-[0.2em] uppercase font-black">Video Monitoring</h3>
                <div className="flex items-center space-x-2 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] text-red-500 font-black uppercase tracking-tighter">LIVE</span>
                </div>
              </div>

              <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-5 border border-white/5 ring-1 ring-white/5 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                {/* Proctoring UI (non-blocking) */}
                <div className="absolute top-3 left-3">
                  <Proctoring
                    videoRef={videoRef}
                    mediaStream={mediaStream}
                    onViolation={handleProctorViolation}
                    onEndExam={handleProctorEndExam}
                    onViolationWarning={handleProctorViolationWarning}
                    threshold={3}
                  />
                </div>
                <div className="absolute bottom-3 right-3 flex items-center space-x-1.5">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-1.5 border border-white/5">
                    <Camera className="h-3 w-3 text-[#00FF88]" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-1.5 border border-white/5">
                    <Mic className="h-3 w-3 text-[#00FF88]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#00B37A] leading-relaxed">
                    Surveillance active. Please maintain focus on the neural node array.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="bg-[#0A0F0A]/80 backdrop-blur-xl border border-[#00FF88]/10 rounded-2xl p-8 mb-8 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Tactical Evaluation</h1>
                  <p className="text-[#00B37A] font-mono text-xs uppercase tracking-widest mt-1">Nodal Sequence {currentQuestionIndex + 1} // {assessmentQuestions.length}</p>
                </div>
                <div className="flex items-center space-x-3 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                  <Clock className="h-5 w-5 text-[#00FF88]" />
                  <span className={`text-2xl font-black tabular-nums tracking-wider ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00FF88] to-[#00CC66] rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,255,136,0.5)]"
                  style={{ width: `${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-[#0A0F0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <div className="text-9xl font-black text-white tracking-widest select-none underline decoration-[#00FF88]/20">{currentQuestionIndex + 1}</div>
              </div>
              <div className="mb-10 relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${currentQuestion.difficulty === 'easy' ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                    LEVEL: {currentQuestion.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mt-4 drop-shadow-md">{currentQuestion.question}</h2>
              </div>

              <div className="space-y-4 mb-12 relative z-10">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${selectedAnswer === index
                      ? 'border-[#00FF88] bg-[#00FF88]/10 shadow-[0_0_30px_rgba(0,255,136,0.1)]'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-center space-x-5">
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selectedAnswer === index
                        ? 'border-[#00FF88] bg-[#00FF88]'
                        : 'border-white/20 group-hover:border-[#00FF88]/50'
                        }`}>
                        {selectedAnswer === index && (
                          <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                        )}
                      </div>
                      <span className={`text-lg font-medium transition-colors ${selectedAnswer === index ? 'text-white' : 'text-[#EAEAEA] group-hover:text-white'}`}>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center relative z-10 pt-8 border-t border-white/5">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[#00B37A] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Backtrack
                </button>

                <button
                  onClick={() => handleNextQuestion()}
                  disabled={selectedAnswer === null}
                  className="px-10 py-4 bg-[#00FF88] text-black rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] hover:bg-[#00CC66] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {currentQuestionIndex === assessmentQuestions.length - 1 ? 'End Protocol' : 'Next Sequence'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};