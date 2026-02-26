import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Briefcase, Users, Brain, RefreshCw, ArrowLeft, Zap, Terminal, ChevronRight } from 'lucide-react';
import { aiService } from '@services/aiService';
import { learnerMemoryService } from '@services/learnerMemoryService';
import { ragDocsService } from '@services/ragDocsService';
import { interviewService, InterviewQuestion } from '@services/interviewService';
import { langflowService } from '@services/langflowService';
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
  context?: {
    courseTitle?: string;
    moduleTitle?: string;
    moduleContent?: string;
  } | null;
}

type ChatMode = 'chat' | 'interview';
type InterviewCategory = 'technical' | 'hr' | 'aptitude';
type ChatProvider = 'gemini' | 'langflow';

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, context }) => {
  const { user } = useAuth();

  const [mode, setMode] = useState<ChatMode>('chat');
  const [chatProvider, setChatProvider] = useState<ChatProvider>('gemini');
  const [langflowSessionId, setLangflowSessionId] = useState<string | null>(null);
  const [interviewCategory, setInterviewCategory] = useState<InterviewCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Hello! I'm your cybersecurity AI assistant. Ask me anything about security concepts, OWASP Top 10, penetration testing, and more.",
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
    setMessages([{ id: Date.now().toString(), message: `Starting ${category.toUpperCase()} interview...`, isUser: false, timestamp: new Date() }]);
    await loadNextQuestion(category);
  };

  const loadNextQuestion = async (category: InterviewCategory) => {
    setIsTyping(true);
    try {
      const question = await interviewService.getNextQuestion(category);
      if (question) {
        setCurrentQuestion(question);
        setIsWaitingForAnswer(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), message: question.question_text, isUser: false, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), message: 'Error loading question. Please try again.', isUser: false, timestamp: new Date() }]);
      }
    } catch (error) {
      console.error('Failed to load question', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInterviewAnswer = async (answer: string) => {
    if (!currentQuestion || !interviewCategory) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), message: answer, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsTyping(true);
    setIsWaitingForAnswer(false);
    try {
      const validation = await interviewService.validateAnswer(currentQuestion, answer);
      const feedbackMsg: ChatMessage = { id: (Date.now() + 1).toString(), message: validation.feedback, isUser: false, timestamp: new Date(), type: 'feedback', feedback: validation };
      setMessages(prev => [...prev, feedbackMsg]);
    } catch (error) {
      console.error('Validation error', error);
    } finally {
      setIsTyping(false);
    }
  };

  // --- General Chat Logic ---
  const handleSendMessage = async () => {
    const messageText = newMessage.trim();
    if (!messageText) return;
    if (mode === 'interview' && isWaitingForAnswer) { handleInterviewAnswer(messageText); return; }

    const userMessage: ChatMessage = { id: Date.now().toString(), message: messageText, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      let response = '';
      if (chatProvider === 'langflow') {
        const lfResponse = await langflowService.sendMessageWithContext(messageText, { courseTitle: context?.courseTitle, moduleTitle: context?.moduleTitle }, langflowSessionId || undefined);
        if (lfResponse.sessionId && !langflowSessionId) setLangflowSessionId(lfResponse.sessionId);
        response = lfResponse.message;
      } else {
        const memory = user?.id ? await learnerMemoryService.getContext(user.id, 8) : '';
        let docs = '';
        try { docs = await ragDocsService.retrieveContext(messageText, 4); } catch { }
        const composedPrompt = `${memory ? `User context:\n${memory}\n\n` : ''}${context ? `Current Course Context:\nCourse: ${context.courseTitle}\nModule: ${context.moduleTitle}\nContent Snippet: ${context.moduleContent?.substring(0, 500)}...\n\n` : ''}${docs ? `Relevant docs:\n${docs}\n\n` : ''}Question: ${messageText}`;
        const userLevel = user?.level || 'beginner';
        const userScore = user?.certificates ? user.certificates.length * 100 : 0;
        const personalizationInstruction = `You are a helpful cybersecurity tutor. User Level: ${userLevel}. Score: ${userScore}. Begin with "Based on your scores [${userScore}] and level [${userLevel}]...". If user shows understanding, append [[UPDATE_SCORE: {"topic": "Name", "delta": 5}]].`;
        response = await aiService.chat(composedPrompt, personalizationInstruction);
        const scoreTagRegex = /\[\[UPDATE_SCORE:\s*({.*?})\]\]/;
        const match = response.match(scoreTagRegex);
        if (match && match[1]) {
          try {
            const updateData = JSON.parse(match[1]);
            if (user?.id && updateData.topic && updateData.delta) learnerMemoryService.updateConfidence(user.id, updateData.topic, updateData.delta);
            response = response.replace(match[0], '').trim();
          } catch { }
        }
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), message: response, isUser: false, timestamp: new Date() }]);
    } catch (error: unknown) {
      console.error('Error generating response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const toggleMode = () => {
    const newMode = mode === 'chat' ? 'interview' : 'chat';
    setMode(newMode);
    setInterviewCategory(null); setCurrentQuestion(null); setIsWaitingForAnswer(false);
    setMessages([{ id: Date.now().toString(), message: newMode === 'chat' ? 'Switched to Chat. How can I help?' : 'Interview mode. Select a category below.', isUser: false, timestamp: new Date() }]);
  };

  if (!isOpen) return null;

  const isInterview = mode === 'interview';
  const isLangflow = chatProvider === 'langflow';

  return (
    <div className="fixed bottom-4 right-4 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col z-9999 overflow-hidden rounded-2xl border border-[#00ff88]/15 bg-[#080d08]"
      style={{ animation: 'chatSlideIn 0.25s cubic-bezier(0.4,0,0.2,1)' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#00ff88]/10 bg-[#0a0f0a] shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center shrink-0">
            {isInterview ? <Brain className="h-4 w-4 text-[#00ff88]" /> : isLangflow ? <Zap className="h-4 w-4 text-[#00ff88]" /> : <Bot className="h-4 w-4 text-[#00ff88]" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {isInterview ? 'Interview Simulator' : isLangflow ? 'Langflow AI' : 'CyberCoach AI'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" style={{ animation: 'statusPulse 2.5s ease-in-out infinite' }} />
              <span className="text-[10px] text-[#4d7a4d]">
                {isInterview ? 'Interview mode' : isLangflow ? 'Langflow' : 'Online'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Provider toggle */}
          {!isInterview && (
            <button
              onClick={() => { const p = chatProvider === 'gemini' ? 'langflow' : 'gemini'; setChatProvider(p); if (p === 'langflow') setLangflowSessionId(null); }}
              className="px-2 py-1 rounded-md text-[10px] font-medium text-[#4d7a4d] border border-[#00ff88]/10 hover:border-[#00ff88]/25 hover:text-[#00ff88] hover:bg-[#00ff88]/5 transition-all"
              title={`Switch to ${chatProvider === 'gemini' ? 'Langflow' : 'Gemini'}`}
            >
              {chatProvider === 'gemini' ? 'Langflow' : 'Gemini'}
            </button>
          )}
          {/* Mode toggle */}
          <button
            onClick={toggleMode}
            className="px-2 py-1 rounded-md text-[10px] font-medium text-[#4d7a4d] border border-[#00ff88]/10 hover:border-[#00ff88]/25 hover:text-[#00ff88] hover:bg-[#00ff88]/5 transition-all"
          >
            {isInterview ? 'Exit Interview' : 'Interview'}
          </button>
          {/* Close */}
          <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center text-[#4d7a4d] hover:text-white hover:bg-[#00ff88]/5 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Context pill ── */}
      {context?.courseTitle && !isInterview && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/5 border-b border-[#00ff88]/8 shrink-0">
          <Terminal className="h-3 w-3 text-[#00ff88]/60 shrink-0" />
          <span className="text-[10px] text-[#4d7a4d] truncate">
            Context: <span className="text-[#99ddaa] font-medium">{context.courseTitle}</span>
            {context.moduleTitle && <> · {context.moduleTitle}</>}
          </span>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto cc-scrollbar px-4 py-3 space-y-3 bg-[#060d06]">

        {/* Interview category selection */}
        {isInterview && !interviewCategory && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-[#4d7a4d] font-medium px-1 mb-3">Choose an interview category:</p>
            {([
              { id: 'technical' as InterviewCategory, label: 'Technical', desc: 'Cybersecurity & Coding', icon: <Brain className="h-4 w-4" /> },
              { id: 'hr' as InterviewCategory, label: 'HR Round', desc: 'Behavioral & Culture Fit', icon: <Users className="h-4 w-4" /> },
              { id: 'aptitude' as InterviewCategory, label: 'Aptitude', desc: 'Logic & Reasoning', icon: <Briefcase className="h-4 w-4" /> },
            ]).map(cat => (
              <button
                key={cat.id}
                onClick={() => startInterview(cat.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#00ff88]/10 bg-[#0f1a0f] hover:bg-[#00ff88]/5 hover:border-[#00ff88]/25 transition-all text-left group"
              >
                <div className="h-8 w-8 rounded-lg bg-[#00ff88]/8 border border-[#00ff88]/15 flex items-center justify-center text-[#00ff88] shrink-0">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{cat.label}</p>
                  <p className="text-xs text-[#4d7a4d]">{cat.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#3d6b3d] group-hover:text-[#00ff88] transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          let timeStr = '';
          try { timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { }

          const isFeedback = msg.type === 'feedback';
          const isCorrect = msg.feedback?.isCorrect;

          return (
            <div key={msg.id} className={`flex flex-col gap-1 ${msg.isUser ? 'items-end' : 'items-start'}`}
              style={{ animation: 'msgIn 0.2s ease-out' }}>
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.isUser
                ? 'bg-[#00ff88] text-black rounded-br-sm font-medium'
                : isFeedback
                  ? isCorrect
                    ? 'bg-[#0a1f0a] border border-[#00ff88]/25 text-[#ccffcc] rounded-bl-sm'
                    : 'bg-[#1f0a0a] border border-red-500/20 text-[#ffcccc] rounded-bl-sm'
                  : 'bg-[#0f1a0f] border border-[#00ff88]/10 text-[#ccffcc] rounded-bl-sm'
                }`}>
                {isFeedback && (
                  <span className="text-[10px] font-bold uppercase tracking-wider mr-2 opacity-70">
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
              <span className="text-[10px] text-[#2d4a2d] px-1">{timeStr}</span>
            </div>
          );
        })}

        {/* Next question button */}
        {messages.length > 0 && messages[messages.length - 1].type === 'feedback' && interviewCategory && (
          <button
            onClick={() => loadNextQuestion(interviewCategory)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1a0f] border border-[#00ff88]/15 text-[#00ff88] text-xs font-medium hover:bg-[#00ff88]/8 transition-all"
          >
            <RefreshCw className="h-3 w-3" /> Next Question
          </button>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-1">
            <div className="bg-[#0f1a0f] border border-[#00ff88]/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#00ff88]/60"
                    style={{ animation: `typing 1.4s ease-in-out ${delay}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex items-end gap-2 px-3 py-3 border-t border-[#00ff88]/10 bg-[#0a0f0a] shrink-0">
        {/* Back button in interview */}
        {isInterview && interviewCategory && (
          <button
            onClick={() => { setInterviewCategory(null); setMessages(prev => [...prev, { id: Date.now().toString(), message: 'Interview paused. Select a category to continue.', isUser: false, timestamp: new Date() }]); }}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-[#4d7a4d] border border-[#00ff88]/10 hover:text-[#00ff88] hover:bg-[#00ff88]/5 transition-all shrink-0"
            title="Back to categories"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isInterview ? 'Type your answer…' : 'Ask anything about cybersecurity…'}
          className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm bg-[#0f1a0f] border border-[#00ff88]/10 text-[#ccffcc] placeholder:text-[#2d4a2d] outline-none focus:border-[#00ff88]/30 transition-colors cc-scrollbar"
          rows={1}
          style={{ minHeight: '40px', maxHeight: '100px' }}
        />

        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || isTyping}
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${!newMessage.trim() || isTyping
            ? 'bg-[#0f1a0f] text-[#2d4a2d] border border-[#00ff88]/5 cursor-not-allowed'
            : 'bg-[#00ff88] text-black hover:bg-[#00dd77] active:scale-95'
            }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes chatSlideIn { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes msgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes typing { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-5px); opacity:1; } }
        @keyframes statusPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
};
