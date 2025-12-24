import React, { useState, useEffect } from 'react';
import { courseService } from '@services/courseService';
import { aiService } from '@services/aiService';
import { useAuth } from '@context/AuthContext';
import type { Course, Module } from '@types';

// Note: User environment might not have framer-motion installed. I'll check package.json or stick to CSS animations to be safe. 
// Checking package.json... I viewed it earlier, but I don't recall seeing framer-motion. I'll stick to Tailwind transitions for safety.

interface ModuleInput {
  title: string;
  description: string;
  content: string;
  id?: string;
}

type FormStep = 'details' | 'modules';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type DetailLevel = 'brief' | 'normal' | 'comprehensive';

interface AiFormState {
  title: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  estimated_hours: number;
}

type CourseFormState = AiFormState;

// Reusable UI components moved form inside component to prevent re-rendering focus loss
const FloatingLabelInput = ({ label, name, value, onChange, type = "text", required = false, min }: any) => (
  <div className="relative group">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      placeholder=" "
      className="block px-4 py-3 w-full text-sm text-white bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-900/70"
    />
    <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-emerald-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
      {label}
    </label>
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 3, required = false }: any) => (
  <div className="relative group">
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      required={required}
      placeholder=" "
      className="block px-4 py-3 w-full text-sm text-white bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 peer backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-900/70 resize-none"
    />
    <label className="absolute text-sm text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-emerald-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
      {label}
    </label>
  </div>
);

interface CourseCreationProps {
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
  course?: Course | null;
}

const CourseCreation: React.FC<CourseCreationProps> = ({ onSuccess, onCancel, course }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('details');

  // Course form state
  const [courseData, setCourseData] = useState<CourseFormState>({
    title: course?.title ?? '',
    description: course?.description ?? '',
    category: course?.category ?? '',
    difficulty: course?.difficulty ?? 'beginner',
    estimated_hours: course?.estimated_hours ?? 0
  });

  // Modules state
  const [modules, setModules] = useState<ModuleInput[]>([]);

  // AI modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [aiModuleCount, setAiModuleCount] = useState<number>(5);
  const [publishAfterAi, setPublishAfterAi] = useState<boolean>(false);
  const [aiDetailLevel, setAiDetailLevel] = useState<'brief' | 'normal' | 'comprehensive'>('comprehensive');
  const [aiForm, setAiForm] = useState<AiFormState>({
    title: courseData.title,
    description: courseData.description,
    category: courseData.category,
    difficulty: courseData.difficulty,
    estimated_hours: courseData.estimated_hours
  });
  const [aiPreviewModules, setAiPreviewModules] = useState<ModuleInput[] | null>(null);

  useEffect(() => {
    if (course) {
      // Load existing modules when editing
      courseService.getModulesByCourse(course.id)
        .then(existingModules => {
          setModules(existingModules.length > 0 ? existingModules : [{ title: '', description: '', content: '' }]);
        })
        .catch(console.error);
    } else {
      // Initialize with one empty module for new courses
      setModules([{ title: '', description: '', content: '' }]);
    }
  }, [course]);

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => {
      if (name === 'estimated_hours') {
        return { ...prev, estimated_hours: Number(value) };
      }
      if (name === 'difficulty') {
        return { ...prev, difficulty: value as DifficultyLevel };
      }
      return { ...prev, [name]: value } as CourseFormState;
    });
  };

  const handleModuleChange = (index: number, field: keyof ModuleInput, value: string) => {
    setModules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addModule = () => {
    if (modules.length >= 10) {
      setError('Maximum limit of 10 modules reached');
      return;
    }
    setModules(prev => [...prev, { title: '', description: '', content: '' }]);
  };

  const removeModule = (index: number) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate current step
    if (currentStep === 'details') {
      if (!courseData.title || !courseData.description || !courseData.category) {
        setError('Please fill in all required course details');
        return;
      }
      setCurrentStep('modules');
      return;
    }

    // Submit logic
    setIsLoading(true);
    try {
      if (modules.length === 0) throw new Error('Please add at least one module');
      const invalidModule = modules.find(m => !m.title || !m.description || !m.content);
      if (invalidModule) throw new Error('Please fill in all module fields');

      const serviceModules = modules.map((m) => ({
        title: m.title,
        description: m.description,
        content: m.content,
        ...(m.id ? { id: m.id } : {})
      })) as Partial<Module>[];

      let savedCourse: Course;
      if (course) {
        savedCourse = await courseService.updateCourse(course.id, {
          ...courseData,
          teacher_id: user?.id,
          modules: serviceModules
        });
      } else {
        savedCourse = await courseService.createCourse({
          ...courseData,
          teacher_id: user?.id,
          is_published: true, // Auto-publish for visibility
          modules: serviceModules
        });
      }

      // Reset
      setCourseData({ title: '', description: '', category: '', difficulty: 'beginner', estimated_hours: 0 });
      setModules([{ title: '', description: '', content: '' }]);
      setCurrentStep('details');
      onSuccess?.(savedCourse);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep('details');
  };

  const generateOutlineWithAi = async (overrides?: Partial<typeof courseData>) => {
    setAiError('');
    setAiLoading(true);
    try {
      if (!aiService.isGeminiEnabled()) throw new Error('AI provider not configured. Set VITE_GEMINI_API_KEY');

      const params = {
        title: overrides?.title ?? aiForm.title ?? courseData.title,
        description: overrides?.description ?? aiForm.description ?? courseData.description,
        category: overrides?.category ?? aiForm.category ?? courseData.category,
        difficulty: overrides?.difficulty ?? aiForm.difficulty ?? courseData.difficulty,
        estimated_hours: overrides?.estimated_hours ?? aiForm.estimated_hours ?? courseData.estimated_hours,
        module_count: aiModuleCount,
        detailLevel: aiDetailLevel,
      };

      const generated = await aiService.generateCourseOutline(params);
      const mapped: ModuleInput[] = generated.map(m => ({
        title: m.title || '',
        description: m.description || '',
        content: m.content || ''
      }));

      setAiPreviewModules(mapped.length > 0 ? mapped : [{ title: '', description: '', content: '' }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAiError(message || 'Failed to generate outline with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const confirmAiCreation = async (publish: boolean) => {
    setIsLoading(true);
    setError('');
    try {
      const finalModules = aiPreviewModules ?? modules;
      if (finalModules.length === 0) throw new Error('No modules generated');
      const invalidModule = finalModules.find(m => !m.title || !m.description || !m.content);
      if (invalidModule) throw new Error('Please complete all generated module fields before creating');

      const serviceModules = finalModules.map(m => ({
        title: m.title,
        description: m.description,
        content: m.content
      })) as Partial<Module>[];

      const savedCourse = await courseService.createCourse({
        ...courseData,
        teacher_id: user?.id,
        is_published: publish,
        modules: serviceModules
      });

      setCourseData({ title: '', description: '', category: '', difficulty: 'beginner', estimated_hours: 0 });
      setModules([{ title: '', description: '', content: '' }]);
      setCurrentStep('details');
      onSuccess?.(savedCourse);
      setShowAiModal(false);
      setAiPreviewModules(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to create AI-generated course');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 font-display">
              {course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Share your knowledge with the world</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'details' ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-700'}`}>1</div>
              <span className="font-medium">Details</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-800 mx-4"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'modules' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'modules' ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-700'}`}>2</div>
              <span className="font-medium">Modules</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 'details' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-5">
                  <FloatingLabelInput label="Course Title" name="title" value={courseData.title} onChange={handleCourseInputChange} required />
                  <TextArea label="Description" name="description" value={courseData.description} onChange={handleCourseInputChange} required />
                  <div className="grid grid-cols-2 gap-5">
                    <FloatingLabelInput label="Category" name="category" value={courseData.category} onChange={handleCourseInputChange} required />
                    <div className="relative group">
                      <select name="difficulty" value={courseData.difficulty} onChange={handleCourseInputChange} className="block px-4 py-3 w-full text-sm text-white bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none backdrop-blur-sm cursor-pointer">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <label className="absolute text-sm text-emerald-500 transform -translate-y-4 scale-75 top-2 left-2 bg-transparent px-2">Difficulty</label>
                      <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">▼</div>
                    </div>
                  </div>
                  <FloatingLabelInput label="Estimated Hours" name="estimated_hours" type="number" value={courseData.estimated_hours} onChange={handleCourseInputChange} required min="0" />
                </div>

                {/* Preview / AI Card */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-bold text-emerald-500 tracking-wider uppercase mb-2">Course Preview</div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{courseData.title || 'Untitled Course'}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-3">{courseData.description || 'Course description will appear here...'}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700">{courseData.category || 'Category'}</span>
                        <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700 capitalize">{courseData.difficulty}</span>
                        <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700">{courseData.estimated_hours}h</span>
                      </div>

                      <button type="button" onClick={() => setShowAiModal(true)} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group/ai">
                        <svg className="w-5 h-5 group-hover/ai:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Autofill with AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium text-lg">Modules ({modules.length}/10)</h3>
                  <button type="button" onClick={addModule} disabled={modules.length >= 10} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Module
                  </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                  {modules.map((module, index) => (
                    <div key={index} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 relative group hover:border-slate-700 transition-colors">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {modules.length > 1 && <button type="button" onClick={() => removeModule(index)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">{index + 1}</div>
                        <div className="flex-1 space-y-4">
                          <FloatingLabelInput label="Module Title" value={module.title} onChange={(e: any) => handleModuleChange(index, 'title', e.target.value)} required />
                          <TextArea label="Description" value={module.description} onChange={(e: any) => handleModuleChange(index, 'description', e.target.value)} rows={2} required />
                          <TextArea label="Module Content (Markdown)" value={module.content} onChange={(e: any) => handleModuleChange(index, 'content', e.target.value)} rows={5} required />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800">
              {currentStep === 'modules' ? (
                <button type="button" onClick={handleBack} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors font-medium">Back</button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-4">
                <button type="button" onClick={onCancel} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                  {currentStep === 'details' ? 'Next Step' : (course ? 'Update Course' : 'Create Course')}
                  {!isLoading && currentStep === 'details' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-indigo-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></span>
                AI Course Generator
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <FloatingLabelInput label="Topic or Title" value={aiForm.title} onChange={(e: any) => setAiForm(prev => ({ ...prev, title: e.target.value }))} />
              <TextArea label="Context / Description" value={aiForm.description} onChange={(e: any) => setAiForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modules</label>
                  <input type="number" min={1} max={12} value={aiModuleCount} onChange={(e) => setAiModuleCount(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detail</label>
                  <select value={aiDetailLevel} onChange={(e) => setAiDetailLevel(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2">
                    <option value="brief">Brief</option>
                    <option value="normal">Normal</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>
              </div>

              {aiPreviewModules && (
                <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <h4 className="text-emerald-400 font-bold mb-3 text-sm uppercase">Generated Draft Preview</h4>
                  <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {aiPreviewModules.map((m, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-slate-600">{i + 1}.</span> {m.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiError && <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded">{aiError}</div>}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              {!aiPreviewModules ? (
                <button onClick={() => generateOutlineWithAi()} disabled={aiLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all">
                  {aiLoading ? 'Dreaming...' : 'Generate Outline'}
                </button>
              ) : (
                <>
                  <button onClick={() => setAiPreviewModules(null)} className="px-4 py-2 text-slate-400 hover:text-white">Back</button>
                  <button onClick={() => confirmAiCreation(true)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold">Create & Publish</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CourseCreation };