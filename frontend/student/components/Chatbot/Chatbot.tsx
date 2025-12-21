import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Briefcase, Users, Brain, RefreshCw, ArrowLeft } from 'lucide-react';
import { aiService } from '@services/aiService';
import { learnerMemoryService } from '@services/learnerMemoryService';
import { ragDocsService } from '@services/ragDocsService';
import { interviewService, InterviewQuestion } from '@services/interviewService';
import { useAuth } from '@context/AuthContext';

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date | string;
  type?: 'text' | 'feedback';
  feedback?: { isCorrect: boolean; feedback: string };
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatMode = 'chat' | 'interview';
type InterviewCategory = 'technical' | 'hr' | 'aptitude';

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // State
  const [mode, setMode] = useState<ChatMode>('chat');
  const [interviewCategory, setInterviewCategory] = useState<InterviewCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Hello! I'm your advanced cybersecurity AI assistant. I can help you with detailed questions about security concepts, OWASP Top 10, penetration testing, and more. What would you like to explore?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- Interview Logic ---

  const startInterview = async (category: InterviewCategory) => {
    setInterviewCategory(category);
    setMessages([
      {
        id: Date.now().toString(),
        message: `Initializing ${category.toUpperCase()} Interview Module... Stand by.`,
        isUser: false,
        timestamp: new Date(),
      }
    ]);
    await loadNextQuestion(category);
  };

  const loadNextQuestion = async (category: InterviewCategory) => {
    setIsTyping(true);
    try {
      const question = await interviewService.getNextQuestion(category);
      if (question) {
        setCurrentQuestion(question);
        setIsWaitingForAnswer(true);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            message: question.question_text,
            isUser: false,
            timestamp: new Date(),
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            message: "Error loading question. Please try again.",
            isUser: false,
            timestamp: new Date(),
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to load question", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInterviewAnswer = async (answer: string) => {
    if (!currentQuestion || !interviewCategory) return;

    // 1. Add user answer
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      message: answer,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsTyping(true);
    setIsWaitingForAnswer(false);

    // 2. Validate
    try {
      const validation = await interviewService.validateAnswer(currentQuestion, answer);

      // 3. Show Feedback
      const feedbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: validation.feedback,
        isUser: false,
        timestamp: new Date(),
        type: 'feedback',
        feedback: validation
      };
      setMessages(prev => [...prev, feedbackMsg]);

    } catch (error) {
      console.error("Validation error", error);
    } finally {
      setIsTyping(false);
    }
  };

  // --- General Chat Logic ---

  const handleSendMessage = async () => {
    const messageText = newMessage.trim();
    if (!messageText) return;

    if (mode === 'interview' && isWaitingForAnswer) {
      handleInterviewAnswer(messageText);
      return;
    }

    // Normal Chat Flow
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Retrieve user memory (if available)
      const memory = user?.id ? await learnerMemoryService.getContext(user.id, 8) : '';

      // Retrieve relevant docs via RAG
      let docs = '';
      try {
        docs = await ragDocsService.retrieveContext(messageText, 4);
      } catch (e) {
        console.warn('RAG docs retrieval failed:', e);
      }

      // Compose AI prompt
      const composedPrompt = `${memory ? `User context:\n${memory}\n\n` : ''}${docs ? `Relevant docs:\n${docs}\n\n` : ''
        }Question: ${messageText}`;

      // Get AI response
      const response = await aiService.chat(composedPrompt, 'You are a helpful cybersecurity tutor.');

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: unknown) {
      console.error('Error generating response:', error);
      const safeMsg = error instanceof Error ? error.message : String(error) || 'Unknown error from AI service.';
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: `There was an issue connecting to Gemini. ${safeMsg}. Please ensure your API key is correctly set as VITE_GEMINI_API_KEY.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'chat' ? 'interview' : 'chat';
    setMode(newMode);
    // Reset state for new mode
    setInterviewCategory(null);
    setCurrentQuestion(null);
    setIsWaitingForAnswer(false);
    setMessages([{
      id: Date.now().toString(),
      message: newMode === 'chat'
        ? "Switched to Standard Chat Mode. How can I help you?"
        : "Switched to Interview Simulation Mode. Select a category below.",
      isUser: false,
      timestamp: new Date(),
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${mode === 'interview' ? 'bg-purple-600' : 'bg-orange-600'} text-white transition-colors duration-300`}>
        <div className="flex items-center space-x-2">
          {mode === 'interview' ? <Brain className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          <div>
            <h3 className="font-bold text-sm">{mode === 'interview' ? 'Interview Simulator' : 'CyberSec AI Assistant'}</h3>
            <p className="text-[10px] opacity-80">{mode === 'interview' ? 'Technical • HR • Aptitude' : 'Ask me anything'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleMode} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
            {mode === 'interview' ? 'Exit Interview' : 'Start Interview'}
          </button>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        {/* Interview Category Selection */}
        {mode === 'interview' && !interviewCategory && (
          <div className="grid grid-cols-1 gap-2 mb-4">
            <button
              onClick={() => startInterview('technical')}
              className="flex items-center p-3 bg-white dark:bg-gray-800 border border-purple-500/30 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
            >
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-md mr-3 group-hover:scale-110 transition-transform">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Technical Round</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Cybersecurity & Coding</div>
              </div>
            </button>

            <button
              onClick={() => startInterview('hr')}
              className="flex items-center p-3 bg-white dark:bg-gray-800 border border-pink-500/30 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all text-left group"
            >
              <div className="bg-pink-100 dark:bg-pink-900/50 p-2 rounded-md mr-3 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">HR Round</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Behavioral & Culture Fit</div>
              </div>
            </button>

            <button
              onClick={() => startInterview('aptitude')}
              className="flex items-center p-3 bg-white dark:bg-gray-800 border border-blue-500/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
            >
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-md mr-3 group-hover:scale-110 transition-transform">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Aptitude Round</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Logic & Reasoning</div>
              </div>
            </button>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} max-w-[85%]`}>
              <div
                className={`p-3 rounded-2xl shadow-sm ${message.isUser
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-tr-none'
                  : message.type === 'feedback'
                    ? message.feedback?.isCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-gray-800 dark:text-green-100 rounded-tl-none'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-gray-800 dark:text-red-100 rounded-tl-none'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                  }`}
              >
                <div className="flex items-start space-x-2">
                  {!message.isUser && (
                    <div className={`mt-0.5 ${message.type === 'feedback' ? (message.feedback?.isCorrect ? 'text-green-500' : 'text-red-500') : 'text-orange-500'}`}>
                      {message.type === 'feedback' ? (message.feedback?.isCorrect ? '✅' : '❌') : <Bot className="h-4 w-4" />}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                    <p className={`text-[10px] mt-1.5 opacity-60 ${message.isUser ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Question Button for Feedback Messages */}
            {message.type === 'feedback' && interviewCategory && message === messages[messages.length - 1] && (
              <button
                onClick={() => loadNextQuestion(interviewCategory)}
                className="mt-2 flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-full shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Next Question</span>
              </button>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-orange-500 animate-bounce" />
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          {mode === 'interview' && interviewCategory && (
            <button
              onClick={() => {
                setInterviewCategory(null);
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  message: "Interview paused. Select a category to continue or switch modes.",
                  isUser: false,
                  timestamp: new Date()
                }]);
              }}
              className="mb-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Back to Categories"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={mode === 'interview' ? "Type your answer here..." : "Ask me anything about cybersecurity..."}
              className="w-full resize-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all pr-10"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className={`mb-0.5 p-3 rounded-xl shadow-md transition-all ${!newMessage.trim() || isTyping
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg active:scale-95'
              }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

