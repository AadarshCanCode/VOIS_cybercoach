import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { Book, Layers, CheckCircle } from 'lucide-react';
import { Step1BasicInfo } from './CourseCreation/Step1BasicInfo';
import { Step2ModuleEditor } from './CourseCreation/Step2ModuleEditor';
import { Step3Review } from './CourseCreation/Step3Review';

interface CourseCreationProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export type CourseData = {
  title: string;
  description: string;
  code: string;
  moduleCount: number;
  modules: {
    title: string;
    content: string;
    quiz?: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
  }[];
};

export const CourseCreation: React.FC<CourseCreationProps> = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CourseData>({
    title: '',
    description: '',
    code: '',
    moduleCount: 1,
    modules: []
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const updateData = (updates: Partial<CourseData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/teacher/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          teacherEmail: user?.email,
          published: true
        })
      });

      if (!response.ok) throw new Error('Failed to create course');

      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Course</h2>
            <p className="text-slate-400 text-sm">Step {step} of 3</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            Close
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <Step1BasicInfo
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <Step2ModuleEditor
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <Step3Review
              data={data}
              onSubmit={handleSubmit}
              onBack={handleBack}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};