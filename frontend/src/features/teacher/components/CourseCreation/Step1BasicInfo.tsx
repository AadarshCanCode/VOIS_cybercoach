import React from 'react';
import { CourseData } from '../CourseCreation';

interface StepProps {
    data: CourseData;
    onUpdate: (data: Partial<CourseData>) => void;
    onNext: () => void;
}

export const Step1BasicInfo: React.FC<StepProps> = ({ data, onUpdate, onNext }) => {
    const isValid = data.title && data.description && data.code && data.moduleCount > 0;

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Course Details</h3>
                <p className="text-slate-400">Define the core structure of your course.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Course Title</label>
                    <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="e.g. Advanced Network Security"
                        value={data.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none h-32"
                        placeholder="What will students learn?"
                        value={data.description}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Course Code</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono tracking-wider uppercase"
                            placeholder="NET-101"
                            value={data.code}
                            onChange={(e) => onUpdate({ code: e.target.value.toUpperCase() })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Students will use this code to enroll.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Number of Modules</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={data.moduleCount}
                            onChange={(e) => onUpdate({ moduleCount: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-8 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Next: Module Content
                </button>
            </div>
        </div>
    );
};
