import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Mic, Volume2, Brain, Users, Terminal, Upload, X, FileText, CheckCircle, Shield, Zap } from 'lucide-react';
import { interviewService, InterviewQuestion } from '../../../services/interviewService';
import { aiService } from '../../../services/aiService';
import { langflowService } from '../../../services/langflowService';

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
            text: "Welcome! This is your AI interview practice. Select a category to begin.",
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [category, setCategory] = useState<InterviewCategory | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
    const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
    const [position, setPosition] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeSummary, setResumeSummary] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [showConfig, setShowConfig] = useState(true);
    const [aiProvider, setAiProvider] = useState<'default' | 'langflow'>('default');
    const [langflowSessionId, setLangflowSessionId] = useState<string | null>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setResumeFile(file);
        setIsParsing(true);

        try {
            let text = "";
            if (file.type === 'application/pdf') {
                text = await extractTextFromPDF(file);
            } else {
                text = await file.text();
            }

            const parsed = await aiService.parseResume(text);
            setResumeSummary(JSON.stringify(parsed));
        } catch (error) {
            console.error("Resume parsing failed", error);
        } finally {
            setIsParsing(false);
        }
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const pdfjs = await import('pdfjs-dist');
            // @ts-ignore
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                // @ts-ignore
                const pageText = content.items.map((item: any) => item.str).join(' ');
                fullText += pageText + "\n";
            }
            return fullText;
        } catch (error) {
            console.error("PDF extraction error", error);
            return "";
        }
    };

    const startInterview = async (selectedCategory: InterviewCategory) => {
        setCategory(selectedCategory);
        setShowConfig(false);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                sender: 'bot',
                text: `Starting ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} interview. Position: ${position || 'General'}. Resume analysis complete.`,
                timestamp: new Date()
            }
        ]);
        await loadNextQuestion(selectedCategory);
    };

    const loadNextQuestion = async (selectedCategory: InterviewCategory) => {
        setIsTyping(true);
        try {
            const question = await interviewService.getNextQuestion(selectedCategory, position, resumeSummary || undefined);
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
                let validation: { isCorrect: boolean; feedback: string };

                if (aiProvider === 'langflow') {
                    // Use Langflow for validation
                    const prompt = `Interview Question: "${currentQuestion.question_text}"
User's Answer: "${userMsg.text}"
${position ? `Position: ${position}` : ''}

Please evaluate this answer and provide feedback. Is it correct? What could be improved?`;

                    const lfResponse = await langflowService.sendMessage(prompt, langflowSessionId || undefined);

                    if (lfResponse.sessionId && !langflowSessionId) {
                        setLangflowSessionId(lfResponse.sessionId);
                    }

                    // Parse Langflow response as feedback
                    const isPositive = lfResponse.message.toLowerCase().includes('correct') ||
                        lfResponse.message.toLowerCase().includes('good') ||
                        lfResponse.message.toLowerCase().includes('well done');

                    validation = {
                        isCorrect: isPositive,
                        feedback: lfResponse.message
                    };
                } else {
                    // Use default interview service
                    validation = await interviewService.validateAnswer(currentQuestion, userMsg.text, position, resumeSummary || undefined);
                }

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
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    text: "I encountered an error processing your answer. Please try again.",
                    timestamp: new Date()
                }]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const resetSimulation = () => {
        setCategory(null);
        setCurrentQuestion(null);
        setIsWaitingForAnswer(false);
        setShowConfig(true);
        setResumeFile(null);
        setResumeSummary(null);
        setMessages([{
            id: Date.now().toString(),
            sender: 'bot',
            text: "Interview reset. Update your details or select a category to begin.",
            timestamp: new Date()
        }]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-[#0A0F0A] border border-[#00FF88]/20 rounded-xl overflow-hidden shadow-2xl font-mono">
            {/* Header */}
            <div className="bg-[#0A0F0A] border-b border-[#00FF88]/10 p-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-wider">AI Interview Practice</h2>
                    <p className="text-xs text-[#00B37A]">
                        {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} interview active` : 'Select a category to begin'}
                        {aiProvider === 'langflow' && ' • Langflow'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const newProvider = aiProvider === 'default' ? 'langflow' : 'default';
                            setAiProvider(newProvider);
                            if (newProvider === 'langflow') {
                                setLangflowSessionId(null);
                            }
                        }}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs ${aiProvider === 'langflow' ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'hover:bg-[#00FF88]/10 text-[#00B37A]'}`}
                        title={`Switch to ${aiProvider === 'default' ? 'Langflow' : 'Default'} AI`}
                    >
                        {aiProvider === 'langflow' ? <Zap className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        {aiProvider === 'langflow' ? 'Langflow' : 'Default'}
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="p-2 hover:bg-[#00FF88]/10 rounded-lg transition-colors text-[#00B37A]"
                        title="Reset Interview"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('/grid-pattern.png')] bg-repeat opacity-90 relative">
                {/* Configuration Overlay */}
                {!category && showConfig && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 mb-8">
                        <div className="bg-[#0A0F0A] border border-[#00FF88]/20 p-6 rounded-xl space-y-6">
                            <h3 className="text-[#00FF88] font-bold tracking-widest text-sm text-center justify-center">
                                Interview Setup
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-[#00B37A] uppercase font-bold mb-2 block">Position</label>
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        placeholder="e.g. Software Engineer, Data Analyst..."
                                        className="w-full bg-black border border-[#00FF88]/20 rounded-lg px-4 py-3 text-white focus:border-[#00FF88]/50 outline-none placeholder-[#00B37A]/30 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-[#00B37A] uppercase font-bold mb-2 block">Resume (PDF/TXT, optional)</label>
                                    {!resumeFile ? (
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.txt"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full border-2 border-dashed border-[#00FF88]/20 group-hover:border-[#00FF88]/50 rounded-lg p-8 flex flex-col items-center justify-center transition-all bg-black/50">
                                                <p className="text-xs text-[#00B37A] font-mono">Drag & drop or click to upload</p>
                                                <p className="text-[10px] text-[#00B37A]/50 mt-2 italic">Resume parsing is private and secure</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 bg-[#00FF88]/5 border border-[#00FF88]/30 rounded-lg animate-in fade-in zoom-in-95">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-[#00FF88]/10 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-[#00FF88]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white truncate max-w-[200px]">{resumeFile.name}</p>
                                                    <p className="text-[10px] text-[#00B37A]">
                                                        {isParsing ? 'Analyzing resume...' : 'Resume processed'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isParsing && <CheckCircle className="h-5 w-5 text-[#00FF88]" />}
                                                <button
                                                    onClick={() => { setResumeFile(null); setResumeSummary(null); }}
                                                    className="p-1 hover:bg-[#FF0055]/10 rounded text-[#FF0055] transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => startInterview('technical')}
                                disabled={isParsing}
                                className="group p-4 bg-[#0A0F0A] border border-[#00FF88]/30 hover:border-[#00FF88] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-10 w-10 rounded-lg bg-[#00FF88]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Terminal className="h-6 w-6 text-[#00FF88]" />
                                </div>
                                <h3 className="text-[#EAEAEA] font-bold mb-1">Technical</h3>
                                <p className="text-xs text-[#00B37A]">Technical and coding questions.</p>
                            </button>

                            <button
                                onClick={() => startInterview('hr')}
                                disabled={isParsing}
                                className="group p-4 bg-[#0A0F0A] border border-[#FF00FF]/30 hover:border-[#FF00FF] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,0,255,0.1)] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-10 w-10 rounded-lg bg-[#FF00FF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6 text-[#FF00FF]" />
                                </div>
                                <h3 className="text-[#EAEAEA] font-bold mb-1">HR</h3>
                                <p className="text-xs text-[#FF00FF]/80">HR and behavioral questions.</p>
                            </button>

                            <button
                                onClick={() => startInterview('aptitude')}
                                disabled={isParsing}
                                className="group p-4 bg-[#0A0F0A] border border-[#00FFFF]/30 hover:border-[#00FFFF] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-10 w-10 rounded-lg bg-[#00FFFF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Brain className="h-6 w-6 text-[#00FFFF]" />
                                </div>
                                <h3 className="text-[#EAEAEA] font-bold mb-1">Aptitude</h3>
                                <p className="text-xs text-[#00FFFF]/80">Aptitude and logic questions.</p>
                            </button>
                        </div>
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
                                    {msg.sender === 'user' ? 'You' : 'AI'}
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
                                        Next Question
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
                            <span className="text-xs text-[#00B37A] ml-2 font-mono">AI is thinking...</span>
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
                            placeholder={category ? "Type your answer..." : "Select a category above..."}
                            disabled={!category || isTyping}
                            className="w-full bg-[#000000] border border-[#00FF88]/20 rounded-xl pl-4 pr-12 py-4 text-[#EAEAEA] focus:outline-none focus:border-[#00FF88]/50 focus:ring-1 focus:ring-[#00FF88]/20 placeholder-[#00B37A]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
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
