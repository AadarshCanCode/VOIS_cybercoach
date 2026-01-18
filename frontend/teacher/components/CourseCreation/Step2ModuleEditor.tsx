import React, { useState, useEffect } from 'react';
import { CourseData } from '../CourseCreation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Sparkles, Loader2, X } from 'lucide-react';

interface StepProps {
    data: CourseData;
    onUpdate: (data: Partial<CourseData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step2ModuleEditor: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [showAiInput, setShowAiInput] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize modules array if empty or size changed
    useEffect(() => {
        if (data.modules.length !== data.moduleCount) {
            const newModules = [...data.modules];
            // Resize array
            if (newModules.length < data.moduleCount) {
                for (let i = newModules.length; i < data.moduleCount; i++) {
                    newModules.push({
                        title: `Module ${i + 1}`,
                        content: '',
                        quiz: { question: '', options: ['', '', '', ''], correctAnswer: '' }
                    });
                }
            } else {
                newModules.length = data.moduleCount;
            }
            onUpdate({ modules: newModules });
        }
    }, [data.moduleCount]);

    const currentModule = data.modules[currentModuleIndex] || {
        title: '',
        content: '',
        quiz: { question: '', options: ['', '', '', ''], correctAnswer: '' }
    };

    const updateCurrentModule = (updates: any) => {
        const newModules = [...data.modules];
        newModules[currentModuleIndex] = { ...newModules[currentModuleIndex], ...updates };
        onUpdate({ modules: newModules });
    };

    const updateQuiz = (quizUpdates: any) => {
        const currentQuiz = currentModule.quiz || { question: '', options: ['', '', '', ''], correctAnswer: '' };
        updateCurrentModule({ quiz: { ...currentQuiz, ...quizUpdates } });
    };

    const updateOption = (index: number, value: string) => {
        const currentQuiz = currentModule.quiz || { question: '', options: ['', '', '', ''], correctAnswer: '' };
        const newOptions = [...currentQuiz.options];
        newOptions[index] = value;
        updateQuiz({ options: newOptions });
    };

    const handleGenerateModule = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiBase}/api/ai/generate-module`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    courseContext: data.title
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || errData.error || 'Failed to generate content');
            }

            const generatedData = await response.json();

            updateCurrentModule({
                title: generatedData.title,
                content: generatedData.content,
                quiz: generatedData.quiz
            });

            setShowAiInput(false);
            setAiPrompt('');
        } catch (error: any) {
            console.error('AI Generation failed:', error);
            alert(`Generation Failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 relative">
            <div className="flex gap-6 h-full">
                {/* Sidebar for Module Navigation */}
                <div className="w-64 flex-shrink-0 border-r border-slate-800 pr-6 overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Modules</h3>
                    <div className="space-y-2">
                        {Array.from({ length: data.moduleCount }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentModuleIndex(idx)}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-all ${currentModuleIndex === idx
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="font-bold">Module {idx + 1}</div>
                                <div className="truncate text-xs opacity-70">
                                    {data.modules[idx]?.title || 'Untitled'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* AI Generation Box */}
                    {showAiInput ? (
                        <div className="mb-6 bg-slate-900 border border-emerald-500/30 rounded-xl p-4 animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Describe what you want in this module
                                </label>
                                <button onClick={() => setShowAiInput(false)} className="text-slate-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g., Explain the concept of Zero Trust Architecture including its core principles..."
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateModule()}
                                />
                                <button
                                    onClick={handleGenerateModule}
                                    disabled={isGenerating}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Generate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setShowAiInput(true)}
                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                            >
                                <Sparkles className="w-3 h-3" />
                                Auto-Fill with AI
                            </button>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Module Title</label>
                        <input
                            type="text"
                            value={currentModule.title}
                            onChange={(e) => updateCurrentModule({ title: e.target.value })}
                            className="w-full bg-transparent text-2xl font-bold text-white border-b border-slate-700 focus:border-emerald-500 focus:outline-none py-2"
                            placeholder="Enter module title..."
                        />
                    </div>

                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="flex gap-4 border-b border-slate-800 mb-6">
                            <TabsTrigger value="content" className="px-4 py-2 text-sm text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 transition-all">
                                Lesson Content
                            </TabsTrigger>
                            <TabsTrigger value="quiz" className="px-4 py-2 text-sm text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 transition-all">
                                Module Quiz
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-4">
                            <textarea
                                value={currentModule.content}
                                onChange={(e) => updateCurrentModule({ content: e.target.value })}
                                className="w-full h-[400px] bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="Enter course content here (Markdown supported)..."
                            />
                        </TabsContent>

                        <TabsContent value="quiz" className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Question</label>
                                <input
                                    type="text"
                                    value={currentModule.quiz?.question}
                                    onChange={(e) => updateQuiz({ question: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    placeholder="What is the main purpose of..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-300">Answer Options</label>
                                {currentModule.quiz?.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <span className="text-slate-500 font-mono w-4">{String.fromCharCode(65 + idx)}.</span>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(idx, e.target.value)}
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                        <input
                                            type="radio"
                                            name={`correct-${currentModuleIndex}`}
                                            checked={currentModule.quiz?.correctAnswer === opt && opt !== ''}
                                            onChange={() => updateQuiz({ correctAnswer: opt })}
                                            className="accent-emerald-500 h-5 w-5"
                                            title="Mark as correct answer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between mt-auto">
                <button
                    onClick={onBack}
                    className="px-6 py-2 text-slate-400 hover:text-white font-medium"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
                >
                    Next: Review & Publish
                </button>
            </div>
        </div>
    );
};
