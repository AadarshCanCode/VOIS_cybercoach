import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Mic, Volume2, Brain, Users, Terminal } from 'lucide-react';
import { interviewService, InterviewQuestion } from '../../../services/interviewService';

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    timestamp: Date;
    type?: 'text' | 'feedback';
    feedback?: { isCorrect: boolean; feedback: string };
}

type InterviewCategory = 'technical' | 'hr' | 'aptitude';

export const InterviewBot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: "Greetings, Operator. I am CORTEX, your tactical interview simulation unit. Select a protocol to begin your assessment.",
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [category, setCategory] = useState<InterviewCategory | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
    const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Auto-advance effect
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.type === 'feedback' && category && !isWaitingForAnswer && !isTyping) {
                const timer = setTimeout(() => {
                    loadNextQuestion(category);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [messages, category, isWaitingForAnswer, isTyping]);

    const startInterview = async (selectedCategory: InterviewCategory) => {
        setCategory(selectedCategory);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                sender: 'bot',
                text: `Initializing ${selectedCategory.toUpperCase()} PROTOCOL... Accessing secure database...`,
                timestamp: new Date()
            }
        ]);
        await loadNextQuestion(selectedCategory);
    };

    const loadNextQuestion = async (selectedCategory: InterviewCategory) => {
        setIsTyping(true);
        try {
            const question = await interviewService.getNextQuestion(selectedCategory);
            if (question) {
                setCurrentQuestion(question);
                setIsWaitingForAnswer(true);
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        sender: 'bot',
                        text: question.question_text,
                        timestamp: new Date()
                    }
                ]);
            } else {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        sender: 'bot',
                        text: "Error accessing database. Retrying connection...",
                        timestamp: new Date()
                    }
                ]);
            }
        } catch (error) {
            console.error("Failed to load question", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        if (category && isWaitingForAnswer && currentQuestion) {
            setIsTyping(true);
            setIsWaitingForAnswer(false);

            try {
                const validation = await interviewService.validateAnswer(currentQuestion, userMsg.text);

                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: validation.feedback,
                    timestamp: new Date(),
                    type: 'feedback',
                    feedback: validation
                };

                setMessages(prev => [...prev, botMsg]);
            } catch (error) {
                console.error("Validation error", error);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const resetSimulation = () => {
        setCategory(null);
        setCurrentQuestion(null);
        setIsWaitingForAnswer(false);
        setMessages([{
            id: Date.now().toString(),
            sender: 'bot',
            text: "Simulation reset. Select a protocol to begin.",
            timestamp: new Date()
        }]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl overflow-hidden shadow-2xl font-mono">
            {/* Header */}
            <div className="bg-[#0A0F0A] border-b border-[#00FF88]/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center relative">
                        <Bot className="h-6 w-6 text-[#00FF88]" />
                        <div className="absolute inset-0 bg-[#00FF88]/20 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wider">CORTEX UNIT</h2>
                        <p className="text-xs text-[#00B37A]">STATUS: {category ? `${category.toUpperCase()} MODE ACTIVE` : 'AWAITING INPUT'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-[#00FF88]/10 rounded-lg transition-colors text-[#00B37A]">
                        <Volume2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="p-2 hover:bg-[#00FF88]/10 rounded-lg transition-colors text-[#00B37A]"
                        title="Reset Simulation"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('/grid-pattern.png')] bg-repeat opacity-90 relative">
                {/* Category Selection Overlay */}
                {!category && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4">
                        <button
                            onClick={() => startInterview('technical')}
                            className="group p-4 bg-[#0A0F0A] border border-[#00FF88]/30 hover:border-[#00FF88] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] text-left"
                        >
                            <div className="h-10 w-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Terminal className="h-6 w-6 text-[#00FF88]" />
                            </div>
                            <h3 className="text-[#EAEAEA] font-bold mb-1">TECHNICAL</h3>
                            <p className="text-xs text-[#00B37A]">Cybersecurity protocols & coding assessments.</p>
                        </button>

                        <button
                            onClick={() => startInterview('hr')}
                            className="group p-4 bg-[#0A0F0A] border border-[#FF00FF]/30 hover:border-[#FF00FF] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,0,255,0.1)] text-left"
                        >
                            <div className="h-10 w-10 rounded-lg bg-[#FF00FF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6 text-[#FF00FF]" />
                            </div>
                            <h3 className="text-[#EAEAEA] font-bold mb-1">BEHAVIORAL</h3>
                            <p className="text-xs text-[#FF00FF]/80">Culture fit & situational analysis.</p>
                        </button>

                        <button
                            onClick={() => startInterview('aptitude')}
                            className="group p-4 bg-[#0A0F0A] border border-[#00FFFF]/30 hover:border-[#00FFFF] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] text-left"
                        >
                            <div className="h-10 w-10 rounded-lg bg-[#00FFFF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Brain className="h-6 w-6 text-[#00FFFF]" />
                            </div>
                            <h3 className="text-[#EAEAEA] font-bold mb-1">APTITUDE</h3>
                            <p className="text-xs text-[#00FFFF]/80">Logic puzzles & cognitive testing.</p>
                        </button>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                                ? 'bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#EAEAEA] rounded-tr-none'
                                : msg.type === 'feedback'
                                    ? msg.feedback?.isCorrect
                                        ? 'bg-[#00FF88]/5 border border-[#00FF88]/30 text-[#00FF88] rounded-tl-none'
                                        : 'bg-[#FF0055]/5 border border-[#FF0055]/30 text-[#FF0055] rounded-tl-none'
                                    : 'bg-[#0A0F0A] border border-[#00B37A]/30 text-[#00B37A] rounded-tl-none shadow-[0_0_15px_rgba(0,255,136,0.05)]'
                                }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase tracking-wider font-bold">
                                    {msg.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                    {msg.sender === 'user' ? 'OPERATOR' : 'CORTEX'}
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                <p className="text-[10px] opacity-30 mt-2 text-right">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        {/* Next Question Button / Auto-advance */}
                        {msg.type === 'feedback' && category && msg === messages[messages.length - 1] && (
                            <div className="mt-4 flex flex-col items-start gap-2 animate-in fade-in slide-in-from-left-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => loadNextQuestion(category)}
                                        className="px-6 py-2 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 border border-[#00FF88]/50 text-[#00FF88] text-xs font-bold rounded-full transition-all"
                                    >
                                        <RefreshCw className="h-3 w-3 inline-block mr-2" />
                                        NEXT MODULE NOW
                                    </button>
                                    <span className="text-[10px] text-[#00B37A] animate-pulse">
                                        Auto-advancing in 5s...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-[#0A0F0A] border border-[#00B37A]/30 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="text-xs text-[#00B37A] ml-2 font-mono">ANALYZING NEURAL PATTERNS...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0A0F0A] border-t border-[#00FF88]/10">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={category ? "Enter response..." : "Select a protocol above..."}
                            disabled={!category || isTyping}
                            className="w-full bg-[#000000] border border-[#00FF88]/20 rounded-xl pl-4 pr-12 py-4 text-[#EAEAEA] focus:outline-none focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 placeholder-[#00B37A]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00B37A] hover:text-[#00FF88] transition-colors">
                            <Mic className="h-5 w-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isTyping || !category}
                        className="bg-[#00FF88] hover:bg-[#00CC66] text-black rounded-xl px-6 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
