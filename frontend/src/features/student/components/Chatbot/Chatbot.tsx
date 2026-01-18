import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot } from 'lucide-react';
import { aiService } from '@services/aiService';
import { learnerMemoryService } from '@services/learnerMemoryService';
import { ragDocsService } from '@services/ragDocsService';
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


export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // State
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


  const handleSendMessage = async () => {
    const messageText = newMessage.trim();
    if (!messageText) return;

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


  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-orange-600 text-white">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-bold text-sm">CyberSec AI Assistant</h3>
            <p className="text-[10px] opacity-80">Ask me anything</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
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
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about cybersecurity..."
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

