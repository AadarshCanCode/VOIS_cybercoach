import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ModuleTestProps {
  moduleId: string;
  moduleTitle: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

// Sample questions for each module (in a real app, these would come from a database)
const getModuleQuestions = (moduleId: string) => {
  type QA = { question: string; options: string[]; correctAnswer: number; explanation?: string };
  const questionSets: Record<string, QA[]> = {
    'module-1': [
      {
        question: 'What is the principle of least privilege?',
        options: [
          'Giving users maximum access to reduce support tickets',
          'Giving users only the minimum access necessary for their role',
          'Removing all user privileges by default',
          'Sharing privileges among team members'
        ],
        correctAnswer: 1,
        explanation: 'The principle of least privilege means providing users with only the minimum access necessary to perform their job functions.'
      },
      {
        question: 'Which of the following is an example of broken access control?',
        options: [
          'Strong password requirements',
          'Multi-factor authentication',
          'Direct object reference without authorization checks',
          'Session timeouts'
        ],
        correctAnswer: 2,
        explanation: 'Direct object references without proper authorization checks allow users to access resources they should not have access to.'
      },
      {
        question: 'How can horizontal privilege escalation be prevented?',
        options: [
          'Implementing proper session management',
          'Using strong encryption',
          'Validating user authorization for each resource access',
          'Regular password changes'
        ],
        correctAnswer: 2,
        explanation: 'Validating user authorization for each resource access ensures users can only access their own data.'
      },
      {
        question: 'What is vertical privilege escalation?',
        options: [
          'Accessing data of users at the same privilege level',
          'Gaining higher-level privileges than intended',
          'Reducing user privileges',
          'Sharing privileges horizontally'
        ],
        correctAnswer: 1,
        explanation: 'Vertical privilege escalation occurs when a user gains access to higher-level privileges than they should have.'
      },
      {
        question: 'Which HTTP method should require proper authorization checks?',
        options: [
          'Only POST requests',
          'Only GET requests',
          'Only PUT and DELETE requests',
          'All HTTP methods'
        ],
        correctAnswer: 3,
        explanation: 'All HTTP methods should have proper authorization checks, not just state-changing methods.'
      }
    ],
    'module-2': [
      {
        question: 'Which encryption algorithm is considered secure for current use?',
        options: ['DES', 'MD5', 'AES-256', 'SHA-1'],
        correctAnswer: 2,
        explanation: 'AES-256 is currently considered secure for encryption purposes.'
      },
      {
        question: 'What is the main purpose of TLS?',
        options: [
          'Data compression',
          'Secure communication over networks',
          'User authentication only',
          'Database encryption'
        ],
        correctAnswer: 1,
        explanation: 'TLS (Transport Layer Security) provides secure communication over networks.'
      }
    ]
  };

  return questionSets[moduleId] || questionSets['module-1']; // Default to module-1 questions
};

export const ModuleTest: React.FC<ModuleTestProps> = ({ moduleId, moduleTitle, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes

  const questions = getModuleQuestions(moduleId);
  const currentQuestion = questions[currentQuestionIndex];

  React.useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitTest();
    }
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(newAnswers[currentQuestionIndex + 1] ?? null);
      } else {
        // Answers already set in state; submit without args
        handleSubmitTest();
      }
    }
  };

  const handleSubmitTest = () => {
    // Calculate score is done when rendering results; just mark show results
    setShowResults(true);
  };

  const calculateScore = (userAnswers: number[]) => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const score = calculateScore(answers);
    const passed = score >= 70;

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Complete!</h2>
            <div className="text-4xl font-bold text-cyan-600 mb-2">{score}%</div>
            <p className="text-lg text-gray-600 mb-6">
              {passed ? 'Congratulations! You passed the test.' : 'You need 70% to pass. Try again!'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{answers.filter((answer, index) => answer === questions[index]?.correctAnswer).length}</div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{questions.length - answers.filter((answer, index) => answer === questions[index]?.correctAnswer).length}</div>
                <div className="text-gray-600">Incorrect</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => onComplete(score)}
                disabled={!passed}
                className={`px-6 py-3 rounded-lg font-medium ${
                  passed
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {passed ? 'Complete Module' : 'Retake Required'}
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Module
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Results</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{moduleTitle} - Test</h1>
          </div>
          <div className="flex items-center space-x-2 text-lg font-medium">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className={timeLeft < 120 ? 'text-red-600' : 'text-gray-900'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswer === index
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
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={currentQuestionIndex === questions.length - 1 ? handleSubmitTest : handleNextQuestion}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};