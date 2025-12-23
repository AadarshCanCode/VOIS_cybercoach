import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { onboardingChatService } from '@services/onboardingChatService';
import { aiService } from '@services/aiService';
import { learnerMemoryService } from '@services/learnerMemoryService';
import { ragDocsService } from '@services/ragDocsService';
import { interviewService, InterviewQuestion } from '@services/interviewService';
import './FloatingChatbot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'feedback';
  feedback?: { isCorrect: boolean; feedback: string };
}

type ChatMode = 'chat' | 'interview';
type InterviewCategory = 'technical' | 'hr' | 'aptitude';

const parseMarkdown = (text: string): string => {
  // Convert **bold** to <strong>bold</strong>
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>italic</em>
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert line breaks to <br>
  parsed = parsed.replace(/\n/g, '<br>');

  // Convert numbered lists
  parsed = parsed.replace(/^(\d+)\.\s/gm, '<br>$1. ');

  // Convert bullet points
  parsed = parsed.replace(/^[-•]\s/gm, '<br>• ');

  return parsed;
};

export const FloatingChatbot = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [interviewCategory, setInterviewCategory] = useState<InterviewCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

  const getInitialMessage = (): Message => {
    if (isLoggedIn) {
      return {
        role: 'assistant',
        content: "Hello! I'm your advanced cybersecurity AI assistant. I can help you with detailed questions about security concepts, OWASP Top 10, penetration testing, and more. What would you like to explore?",
        timestamp: new Date()
      };
    } else {
      return {
        role: 'assistant',
        content: "👋 Hi! I'm your CyberCoach assistant. I'm here to help you navigate our platform and get started with your cybersecurity learning journey. How can I help you today?",
        timestamp: new Date()
      };
    }
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Reset messages when login state changes
  useEffect(() => {
    setMessages([getInitialMessage()]);
    setMode('chat');
    setInterviewCategory(null);
    setCurrentQuestion(null);
    setIsWaitingForAnswer(false);
  }, [isLoggedIn]);

  // Interview mode functions (only for logged in users)
  const startInterview = async (category: InterviewCategory) => {
    if (!isLoggedIn) return;

    setInterviewCategory(category);
    setMessages([
      {
        role: 'assistant',
        content: `Initializing ${category.toUpperCase()} Interview Module... Stand by.`,
        timestamp: new Date(),
      }
    ]);
    await loadNextQuestion(category);
  };

  const loadNextQuestion = async (category: InterviewCategory) => {
    setIsLoading(true);
    try {
      const question = await interviewService.getNextQuestion(category);
      if (question) {
        setCurrentQuestion(question);
        setIsWaitingForAnswer(true);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: question.question_text,
            timestamp: new Date(),
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "Error loading question. Please try again.",
            timestamp: new Date(),
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to load question", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewAnswer = async (answer: string) => {
    if (!currentQuestion || !interviewCategory) return;

    const userMsg: Message = {
      role: 'user',
      content: answer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setIsWaitingForAnswer(false);

    try {
      const validation = await interviewService.validateAnswer(currentQuestion, answer);

      const feedbackMsg: Message = {
        role: 'assistant',
        content: validation.feedback,
        timestamp: new Date(),
        type: 'feedback',
        feedback: validation
      };
      setMessages(prev => [...prev, feedbackMsg]);
    } catch (error) {
      console.error("Validation error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    if (!isLoggedIn) return;

    const newMode = mode === 'chat' ? 'interview' : 'chat';
    setMode(newMode);
    setInterviewCategory(null);
    setCurrentQuestion(null);
    setIsWaitingForAnswer(false);
    setMessages([{
      role: 'assistant',
      content: newMode === 'chat'
        ? "Switched to Standard Chat Mode. How can I help you?"
        : "Switched to Interview Simulation Mode. Select a category below.",
      timestamp: new Date(),
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Handle interview mode answer
    if (isLoggedIn && mode === 'interview' && isWaitingForAnswer) {
      handleInterviewAnswer(inputValue);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response: string;

      if (isLoggedIn) {
        // Use advanced chatbot with RAG and memory for logged in users
        const memory = user?.id ? await learnerMemoryService.getContext(user.id, 8) : '';

        let docs = '';
        try {
          docs = await ragDocsService.retrieveContext(inputValue, 4);
        } catch (e) {
          console.warn('RAG docs retrieval failed:', e);
        }

        const composedPrompt = `${memory ? `User context:\n${memory}\n\n` : ''}${docs ? `Relevant docs:\n${docs}\n\n` : ''}Question: ${inputValue}`;
        response = await aiService.chat(composedPrompt, 'You are a helpful cybersecurity tutor.');
      } else {
        // Use onboarding service for non-logged in users
        response = await onboardingChatService.sendMessage(inputValue);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: isLoggedIn
          ? "I apologize, but I'm having trouble responding right now. Please try again in a moment."
          : "I apologize, but I'm having trouble responding right now. Please try again in a moment, or feel free to explore the platform on your own!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="floating-chatbot-button"
        aria-label="Open chat assistant"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
        <span className="chatbot-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`floating-chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="chatbot-avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </div>
          <div className="chatbot-title">
            <h3>{isLoggedIn && mode === 'interview' ? 'Interview Simulator' : 'CyberCoach Assistant'}</h3>
            <span className="chatbot-status">
              <span className="status-dot"></span>
              {isLoggedIn && mode === 'interview' ? 'Interview Mode' : 'Online'}
            </span>
          </div>
        </div>
        <div className="chatbot-controls">
          {isLoggedIn && (
            <button
              onClick={toggleMode}
              className="chatbot-mode-btn"
              title={mode === 'interview' ? 'Exit Interview' : 'Start Interview'}
            >
              {mode === 'interview' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={toggleChat}
            className="chatbot-control-btn"
            aria-label="Minimize chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <button
            onClick={closeChat}
            className="chatbot-control-btn"
            aria-label="Close chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {/* Interview Category Selection */}
            {isLoggedIn && mode === 'interview' && !interviewCategory && (
              <div className="interview-categories">
                <button
                  onClick={() => startInterview('technical')}
                  className="interview-category-btn technical"
                >
                  <div className="category-icon">💻</div>
                  <div className="category-info">
                    <div className="category-title">Technical Round</div>
                    <div className="category-desc">Cybersecurity & Coding</div>
                  </div>
                </button>

                <button
                  onClick={() => startInterview('hr')}
                  className="interview-category-btn hr"
                >
                  <div className="category-icon">👥</div>
                  <div className="category-info">
                    <div className="category-title">HR Round</div>
                    <div className="category-desc">Behavioral & Culture Fit</div>
                  </div>
                </button>

                <button
                  onClick={() => startInterview('aptitude')}
                  className="interview-category-btn aptitude"
                >
                  <div className="category-icon">🧠</div>
                  <div className="category-info">
                    <div className="category-title">Aptitude Round</div>
                    <div className="category-desc">Logic & Reasoning</div>
                  </div>
                </button>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
              >
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                />
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!isLoggedIn && (
            <div className="chatbot-quick-actions">
              <button
                onClick={() => setInputValue("How do I get started?")}
                className="quick-action-btn"
              >
                🚀 Get Started
              </button>
              <button
                onClick={() => setInputValue("What courses are available?")}
                className="quick-action-btn"
              >
                📚 Browse Courses
              </button>
              <button
                onClick={() => setInputValue("How does the platform work?")}
                className="quick-action-btn"
              >
                ❓ Platform Guide
              </button>
            </div>
          )}

          {isLoggedIn && mode === 'interview' && currentQuestion && (
            <div className="chatbot-quick-actions">
              <button
                onClick={() => loadNextQuestion(interviewCategory!)}
                className="quick-action-btn"
              >
                ⏭️ Next Question
              </button>
            </div>
          )}

          <div className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about CyberCoach..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="chatbot-send-btn"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
