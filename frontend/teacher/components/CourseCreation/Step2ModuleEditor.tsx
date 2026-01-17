import React, { useState, useEffect } from 'react';
import { CourseData } from '../CourseCreation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';

interface StepProps {
    data: CourseData;
    onUpdate: (data: Partial<CourseData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step2ModuleEditor: React.FC<StepProps> = ({ data, onUpdate, onNext, onBack }) => {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

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

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
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
