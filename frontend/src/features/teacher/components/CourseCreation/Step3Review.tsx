import React from 'react';
import { CourseData } from '../CourseCreation';
import { Check, AlertTriangle, FileText, HelpCircle } from 'lucide-react';

interface StepProps {
    data: CourseData;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

export const Step3Review: React.FC<StepProps> = ({ data, onSubmit, onBack, loading }) => {
    const totalQuestions = data.modules.reduce((acc, m) => acc + (m.quiz?.question ? 1 : 0), 0);
    const totalContentLength = data.modules.reduce((acc, m) => acc + (m.content?.length || 0), 0);

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Review & Publish</h3>
                <p className="text-slate-400">Review your course details before making it live.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Course Summary Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-2xl font-bold text-emerald-400 mb-1">{data.title}</h4>
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-mono border border-slate-700">
                                    {data.code}
                                </span>
                                <span className="text-slate-500 text-sm">
                                    {data.moduleCount} Modules
                                </span>
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                            <Check className="h-6 w-6 text-emerald-500" />
                        </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-slate-400">
                        <p>{data.description}</p>
                    </div>
                </div>

                {/* Content Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Content Volume</p>
                            <p className="text-lg font-bold text-white">{totalContentLength} chars</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-lg">
                            <HelpCircle className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Quizzes</p>
                            <p className="text-lg font-bold text-white">{totalQuestions} questions</p>
                        </div>
                    </div>
                </div>

                {/* Module List Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800">
                        <h5 className="font-bold text-slate-400 text-sm uppercase">Curriculum Preview</h5>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {data.modules.map((module, idx) => (
                            <div key={idx} className="p-4 flex items-start gap-4 hover:bg-slate-800/50 transition-colors">
                                <span className="text-slate-600 font-mono text-sm mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                                <div className="flex-1">
                                    <h6 className="font-bold text-white text-sm mb-1">{module.title || 'Untitled Module'}</h6>
                                    <div className="flex gap-4 text-xs">
                                        <span className={`flex items-center gap-1 ${module.content ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {module.content ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                            Content
                                        </span>
                                        <span className={`flex items-center gap-1 ${module.quiz?.question ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {module.quiz?.question ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 block rounded-full bg-slate-700" />}
                                            Quiz
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between mt-auto">
                <button
                    onClick={onBack}
                    className="px-6 py-2 text-slate-400 hover:text-white font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    Back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        'Publish Course'
                    )}
                </button>
            </div>
        </div>
    );
};
