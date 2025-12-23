import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Camera, Mic, Video, ArrowRight } from 'lucide-react';
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

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      // Save response to database
      saveAssessmentResponse();

      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);

      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(answers[currentQuestionIndex + 1] ?? null);
        setQuestionStartTime(new Date()); // Reset timer for next question
      } else {
        handleSubmitTest(newAnswers);
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

  const handleSubmitTest = async (finalAnswers = answers) => {
    // called when exam ends (manual or proctoring)
    // Save final response if not already saved
    if (selectedAnswer !== null) {
      saveAssessmentResponse();
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
    handleSubmitTest();
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

      await supabase.from('assessment_responses').insert({
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
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <Video className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Camera and Microphone Access Required</h2>
              <p className="text-gray-600 mb-6">
                To ensure the integrity of the assessment, we require access to your camera and microphone during the test.
                This helps us maintain a secure testing environment.
              </p>
            </div>

            {permissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-medium">{permissionError}</p>
              </div>
            )}

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold text-cyan-900 mb-3">What we monitor:</h3>
              <div className="space-y-2 text-cyan-800">
                <div className="flex items-start space-x-3">
                  <Camera className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Your video feed to ensure you remain present during the assessment</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Mic className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Audio monitoring to maintain test security</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Privacy Notice:</strong> Your video and audio are monitored in real-time but are not recorded or stored.
                This monitoring is solely for maintaining assessment integrity.
              </p>
            </div>

            <button
              onClick={requestMediaPermissions}
              disabled={isRequestingPermission}
              className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequestingPermission ? 'Requesting Access...' : 'Grant Camera & Microphone Access'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.completedAssessment && !showResults) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
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
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
            <div className="mb-6">
              {score >= 85 ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              ) : score >= 65 ? (
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
            <div className="text-6xl font-bold text-cyan-600 mb-2">{score}%</div>
            <p className="text-xl text-gray-600 mb-6">
              Your cybersecurity level: <span className="font-bold capitalize text-cyan-600">{level}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{answers.filter((answer, index) => answer === assessmentQuestions[index].correctAnswer).length}</div>
                <div className="text-gray-600">Correct Answers</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{assessmentQuestions.length - answers.filter((answer, index) => answer === assessmentQuestions[index].correctAnswer).length}</div>
                <div className="text-gray-600">Incorrect Answers</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{assessmentQuestions.length}</div>
                <div className="text-gray-600">Total Questions</div>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-cyan-800 mb-2">What's Next?</h3>
              <p className="text-cyan-700">
                Based on your performance, we've unlocked the appropriate OWASP Top 10 course for your level.
                Start learning with hands-on labs and practical exercises!
              </p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-700">{submitError}</div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  // Navigate to courses section
                  window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'courses' } }));
                  window.location.reload();
                }}
                disabled={submitting}
                className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors text-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{submitting ? 'Finalizing…' : 'Start Learning'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.reload()}
                disabled={submitting}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium disabled:opacity-50"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Results</h3>
            <div className="space-y-4">
              {assessmentQuestions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Your answer:</span> {question.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-700">{question.explanation}</p>
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
    <div className="p-6">
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

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Video Monitoring</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-600 font-medium">LIVE</span>
                </div>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                {/* Proctoring UI (non-blocking) */}
                <div className="absolute top-2 left-2">
                  <Proctoring
                    videoRef={videoRef}
                    mediaStream={mediaStream}
                    onViolation={handleProctorViolation}
                    onEndExam={handleProctorEndExam}
                    onViolationWarning={handleProctorViolationWarning}
                    threshold={3}
                  />
                </div>
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <div className="bg-black bg-opacity-60 rounded-full p-1.5">
                    <Camera className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-black bg-opacity-60 rounded-full p-1.5">
                    <Mic className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Your camera and microphone are active for proctoring purposes. Please remain visible throughout the assessment.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Cybersecurity Assessment</h1>
                  <p className="text-gray-600">Question {currentQuestionIndex + 1} of {assessmentQuestions.length}</p>
                </div>
                <div className="flex items-center space-x-2 text-lg font-medium">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === index
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedAnswer === index
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-gray-300'
                        }`}>
                        {selectedAnswer === index && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <button
                  onClick={() => currentQuestionIndex === assessmentQuestions.length - 1 ? handleSubmitTest() : handleNextQuestion()}
                  disabled={selectedAnswer === null}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentQuestionIndex === assessmentQuestions.length - 1 ? 'Submit Test' : 'Next Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};