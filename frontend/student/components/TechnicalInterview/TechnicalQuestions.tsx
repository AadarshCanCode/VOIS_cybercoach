import React, { useState, useEffect, useRef } from 'react';
import { Building2, Clock, Star, ChevronRight, Lightbulb, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { technicalQuestions, TechnicalQuestion } from '@data/technicalQuestions';

export const TechnicalQuestions: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<TechnicalQuestion | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Camera/Microphone preview state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const stopMedia = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const startMedia = async () => {
    if (isRequestingMedia || mediaStream) return;
    setIsRequestingMedia(true);
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch {
          // ignore autoplay rejection; user can press play
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Permission denied or no devices found';
      setMediaError(message);
    } finally {
      setIsRequestingMedia(false);
    }
  };

  // Start/stop camera when entering/leaving a question view
  useEffect(() => {
    if (selectedQuestion) {
      startMedia();
    } else {
      stopMedia();
    }
    return () => {
      stopMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestion]);

  // Timer functionality
  useEffect(() => {
    if (isTimerActive && timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      alert('Time is up! You can still continue working on the solution.');
    }
  }, [timeLeft, isTimerActive]);

  const startTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setIsTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'junior': return 'bg-green-100 text-green-800 border-green-200';
      case 'mid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'senior': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'principal': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompanyLogo = (company: string) => {
    const logos: Record<string, string> = {
      'Google': '🔍',
      'Microsoft': '🪟',
      'Amazon': '📦',
      'Meta (Facebook)': '👥',
      'Apple': '🍎',
      'Netflix': '🎬'
    };
    return logos[company] || '🏢';
  };

  const companies = [...new Set(technicalQuestions.map(q => q.company))];
  const difficulties = ['junior', 'mid', 'senior', 'principal'];
  const categories = [...new Set(technicalQuestions.map(q => q.category))];

  const filteredQuestions = technicalQuestions.filter(question => {
    return (filterCompany === 'all' || question.company === filterCompany) &&
      (filterDifficulty === 'all' || question.difficulty === filterDifficulty) &&
      (filterCategory === 'all' || question.category === filterCategory);
  });

  const handleQuestionSelect = (question: TechnicalQuestion) => {
    setSelectedQuestion(question);
    setShowSolution(false);
    setShowHints(false);
    setCurrentHintIndex(0);
    setUserAnswer('');
    setTimeLeft(null);
    setIsTimerActive(false);
  };

  const handleShowNextHint = () => {
    if (currentHintIndex < selectedQuestion!.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  if (selectedQuestion) {
    return (
      <div className="p-6 bg-page min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center space-x-2 text-muted hover:text-primary transition-colors"
            >
              <span>← Back to Questions</span>
            </button>

            {timeLeft !== null && (
              <div className="flex items-center space-x-2 text-lg font-medium">
                <Clock className="h-5 w-5 text-accent" />
                <span className={timeLeft < 300 ? 'text-accent' : 'text-contrast'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {/* Question Info */}
          <div className="bg-card rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{getCompanyLogo(selectedQuestion.company)}</div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">{selectedQuestion.company}</h1>
                  <p className="text-muted">{selectedQuestion.position}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-accent">
                  {selectedQuestion.category}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400 dark:text-gray-400 light:text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{selectedQuestion.timeLimit} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{selectedQuestion.tags.join(', ')}</span>
              </div>
            </div>

            {!isTimerActive && timeLeft === null && (
              <button
                onClick={() => startTimer(selectedQuestion.timeLimit)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Start Timer ({selectedQuestion.timeLimit} min)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question and Answer Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-primary mb-4">Question</h2>
                <div className="prose max-w-none text-muted">
                  <pre className="whitespace-pre-wrap font-sans">{selectedQuestion.question}</pre>
                </div>
              </div>

              {/* User Answer Area */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Your Solution</h3>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your solution here..."
                  className="w-full h-64 p-4 border border-card rounded-lg bg-card text-contrast font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted">
                    {userAnswer.length} characters
                  </div>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex items-center space-x-2 btn-primary btn-primary-rounded"
                  >
                    {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showSolution ? 'Hide Solution' : 'Show Solution'}</span>
                  </button>
                </div>
              </div>

              {/* Solution */}
              {showSolution && (
                <div className="bg-card border border-card rounded-lg p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Official Solution</h3>
                  <div className="prose max-w-none text-muted">
                    <div dangerouslySetInnerHTML={{
                      __html: selectedQuestion.solution
                        .replace(/\n/g, '<br/>')
                        .replace(/```([^`]+)```/g, '<pre class="bg-card text-accent p-4 rounded mt-4 mb-4 overflow-x-auto"><code>$1</code></pre>')
                        .replace(/`([^`]+)`/g, '<code class="bg-card text-accent px-1 rounded">$1</code>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    }} />
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-bold text-primary mb-2">Explanation</h4>
                    <p className="text-muted">{selectedQuestion.explanation}</p>
                  </div>

                  {selectedQuestion.followUpQuestions && (
                    <div className="mt-4">
                      <h4 className="font-bold text-green-800 dark:text-green-300 light:text-green-800 mb-2">Follow-up Questions</h4>
                      <ul className="list-disc list-inside text-green-700 dark:text-green-200 light:text-green-700">
                        {selectedQuestion.followUpQuestions.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hints Sidebar */}
            <div className="space-y-6">
              {/* Camera & Mic Preview */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary">Camera & Microphone</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startMedia}
                      disabled={isRequestingMedia || !!mediaStream}
                      className={`px-3 py-1 rounded-lg text-sm ${mediaStream ? 'bg-muted text-contrast cursor-not-allowed' : 'btn-primary'}`}
                    >
                      {isRequestingMedia ? 'Starting…' : mediaStream ? 'Active' : 'Start'}
                    </button>
                    <button
                      onClick={stopMedia}
                      disabled={!mediaStream}
                      className={`px-3 py-1 rounded-lg text-sm ${mediaStream ? 'btn-cta' : 'bg-muted text-contrast cursor-not-allowed'}`}
                    >
                      Stop
                    </button>
                  </div>
                </div>

                {mediaError && (
                  <div className="mb-3 text-sm text-accent">
                    {mediaError}. Please allow camera and microphone permissions in your browser and ensure no other app is using them.
                  </div>
                )}

                <div className="aspect-video bg-card rounded-lg overflow-hidden border border-card flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  Preview shows your camera. Microphone is enabled for realism; audio is not recorded.
                </p>
              </div>
              {/* Hints */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary">Hints</h3>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-accent hover:opacity-90 transition-colors"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </button>
                </div>

                {showHints ? (
                  <div className="space-y-3">
                    {selectedQuestion.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                      <div key={index} className="p-3 bg-muted border border-card rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-accent mt-0.5" />
                          <p className="text-muted text-sm">{hint}</p>
                        </div>
                      </div>
                    ))}

                    {currentHintIndex < selectedQuestion.hints.length - 1 && (
                      <button
                        onClick={handleShowNextHint}
                        className="w-full btn-primary py-2 rounded-lg text-sm"
                      >
                        Show Next Hint ({currentHintIndex + 2}/{selectedQuestion.hints.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-500 text-sm">
                    Click the lightbulb to reveal hints when you need help.
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {userAnswer.length > 0 ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-card rounded-full"></div>
                    )}
                    <span className="text-muted">Started writing solution</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {showHints ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-card rounded-full"></div>
                    )}
                    <span className="text-muted">Used hints</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {showSolution ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-card rounded-full"></div>
                    )}
                    <span className="text-muted">Viewed solution</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.tags.map((tag, index) => (
                    <span key={index} className="bg-muted text-muted px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question and Answer Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-primary mb-4">Question</h2>
                <div className="prose max-w-none text-muted">
                  <pre className="whitespace-pre-wrap font-sans">{selectedQuestion.question}</pre>
                </div>
              </div>

              {/* User Answer Area */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Your Solution</h3>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your solution here..."
                  className="w-full h-64 p-4 border border-card rounded-lg bg-card text-contrast font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted">
                    {userAnswer.length} characters
                  </div>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex items-center space-x-2 btn-primary btn-primary-rounded"
                  >
                    {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showSolution ? 'Hide Solution' : 'Show Solution'}</span>
                  </button>
                </div>
              </div>

              {/* Solution */}
              {showSolution && (
                <div className="bg-card border border-card rounded-lg p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Official Solution</h3>
                  <div className="prose max-w-none text-muted">
                    <div dangerouslySetInnerHTML={{
                      __html: selectedQuestion.solution
                        .replace(/\n/g, '<br/>')
                        .replace(/```([^`]+)```/g, '<pre class="bg-card text-accent p-4 rounded mt-4 mb-4 overflow-x-auto"><code>$1</code></pre>')
                        .replace(/`([^`]+)`/g, '<code class="bg-card text-accent px-1 rounded">$1</code>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    }} />
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-bold text-primary mb-2">Explanation</h4>
                    <p className="text-muted">{selectedQuestion.explanation}</p>
                  </div>

                  {selectedQuestion.followUpQuestions && (
                    <div className="mt-4">
                      <h4 className="font-bold text-green-800 dark:text-green-300 light:text-green-800 mb-2">Follow-up Questions</h4>
                      <ul className="list-disc list-inside text-green-700 dark:text-green-200 light:text-green-700">
                        {selectedQuestion.followUpQuestions.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hints Sidebar */}
            <div className="space-y-6">
              {/* Camera & Mic Preview */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary">Camera & Microphone</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startMedia}
                      disabled={isRequestingMedia || !!mediaStream}
                      className={`px-3 py-1 rounded-lg text-sm ${mediaStream ? 'bg-muted text-contrast cursor-not-allowed' : 'btn-primary'}`}
                    >
                      {isRequestingMedia ? 'Starting…' : mediaStream ? 'Active' : 'Start'}
                    </button>
                    <button
                      onClick={stopMedia}
                      disabled={!mediaStream}
                      className={`px-3 py-1 rounded-lg text-sm ${mediaStream ? 'btn-cta' : 'bg-muted text-contrast cursor-not-allowed'}`}
                    >
                      Stop
                    </button>
                  </div>
                </div>

                {mediaError && (
                  <div className="mb-3 text-sm text-accent">
                    {mediaError}. Please allow camera and microphone permissions in your browser and ensure no other app is using them.
                  </div>
                )}

                <div className="aspect-video bg-card rounded-lg overflow-hidden border border-card flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  Preview shows your camera. Microphone is enabled for realism; audio is not recorded.
                </p>
              </div>
              {/* Hints */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary">Hints</h3>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-accent hover:opacity-90 transition-colors"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </button>
                </div>

                {showHints ? (
                  <div className="space-y-3">
                    {selectedQuestion.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                      <div key={index} className="p-3 bg-muted border border-card rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-accent mt-0.5" />
                          <p className="text-muted text-sm">{hint}</p>
                        </div>
                      </div>
                    ))}

                    {currentHintIndex < selectedQuestion.hints.length - 1 && (
                      <button
                        onClick={handleShowNextHint}
                        className="w-full btn-primary py-2 rounded-lg text-sm"
                      >
                        Show Next Hint ({currentHintIndex + 2}/{selectedQuestion.hints.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-500 text-sm">
                    Click the lightbulb to reveal hints when you need help.
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {userAnswer.length > 0 ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-card rounded-full"></div>
                    )}
                    <span className="text-muted">Started writing solution</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {showHints ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-card rounded-full"></div>
                    )}
                    <span className="text-muted">Used hints</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {showSolution ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-card rounded-full"></div>
                    )}
                    <span className="text-muted">Viewed solution</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.tags.map((tag, index) => (
                    <span key={index} className="bg-muted text-muted px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Technical Interview Questions</h1>
          <p className="text-muted-foreground text-lg">
            Practice with real cybersecurity interview questions from top tech companies
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Company</label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-3 py-2 border border-card rounded-lg bg-muted text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-card rounded-lg bg-muted text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-card rounded-lg bg-muted text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid gap-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              onClick={() => handleQuestionSelect(question)}
              className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 border border-white/10 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getCompanyLogo(question.company)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{question.company}</h3>
                    <p className="text-muted-foreground">{question.position}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.toUpperCase()}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium mr-3 bg-secondary/50 text-secondary-foreground border border-white/10">
                  {question.category}
                </span>
                <span className="text-muted-foreground text-sm">
                  {question.timeLimit} minutes
                </span>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-3">
                {question.question.substring(0, 200)}...
              </p>

              <div className="flex flex-wrap gap-2">
                {question.tags.slice(0, 4).map((tag, index) => (
                  <span key={index} className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-xs border border-white/10">
                    {tag}
                  </span>
                ))}
                {question.tags.length > 4 && (
                  <span className="text-muted-foreground text-xs">
                    +{question.tags.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No questions found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};