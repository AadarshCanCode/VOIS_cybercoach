import React, { useState, useEffect } from 'react';
import { courseService } from '@services/courseService';
import { aiService } from '@services/aiService';
import { useAuth } from '@context/AuthContext';
import type { Course, Module } from '@types';

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
  // Load existing modules if editing
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
      // Move to modules step
      setCurrentStep('modules');
      return;
    }

    // If we're on the modules step, proceed with course creation
    setIsLoading(true);

    try {
      // Validate at least one module
      if (modules.length === 0) {
        throw new Error('Please add at least one module');
      }

      // Validate required module fields
      const invalidModule = modules.find(m => !m.title || !m.description || !m.content);
      if (invalidModule) {
        throw new Error('Please fill in all module fields');
      }

      let savedCourse: Course;

      if (course) {
        // Update existing course
        savedCourse = await courseService.updateCourse(course.id, {
          ...courseData,
          teacher_id: user?.id
        });

        // Update existing modules and create new ones
          await Promise.all(modules.map((module, index) => {
          // If it's an existing module, update it
          const mod = module as Partial<Module>;
          if (mod.id) {
            return courseService.updateModule(mod.id, {
              ...mod,
              module_order: index + 1
            });
          }
          // Otherwise create a new module
          return courseService.createModule({
            ...mod,
            course_id: course.id,
            module_order: index + 1
          });
        }));
      } else {
        // Create new course
        savedCourse = await courseService.createCourse({
          ...courseData,
          teacher_id: user?.id,
          is_published: false
        });

        // Create new modules
        await Promise.all(modules.map((module, index) => 
          courseService.createModule({
            ...module,
            course_id: savedCourse.id,
            module_order: index + 1
          })
        ));
      }

      // Clear form
      setCourseData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        estimated_hours: 0
      });
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

  // AI generation: call aiService to create modules from provided courseData
  const generateOutlineWithAi = async (overrides?: Partial<typeof courseData>) => {
    setAiError('');
    setAiLoading(true);
    try {
      if (!aiService.isGeminiEnabled()) {
        throw new Error('AI provider not configured. Set VITE_GEMINI_API_KEY');
      }

      const params: Parameters<typeof aiService.generateCourseOutline>[0] = {
        title: overrides?.title ?? aiForm.title ?? courseData.title,
        description: overrides?.description ?? aiForm.description ?? courseData.description,
        category: overrides?.category ?? aiForm.category ?? courseData.category,
        difficulty: overrides?.difficulty ?? aiForm.difficulty ?? courseData.difficulty,
        estimated_hours: overrides?.estimated_hours ?? aiForm.estimated_hours ?? courseData.estimated_hours,
        module_count: aiModuleCount,
        detailLevel: aiDetailLevel,
      };

      const generated = await aiService.generateCourseOutline(params);

      // Map AI modules into ModuleInput and set into preview state for confirmation
      const mapped: ModuleInput[] = generated.map(m => ({
        title: m.title || '',
        description: m.description || '',
        content: m.content || ''
      }));

      setAiPreviewModules(mapped.length > 0 ? mapped : [{ title: '', description: '', content: '' }]);
      // Keep modal open and show preview for confirmation
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
      // Use preview modules if present
      const finalModules = aiPreviewModules ?? modules;
      if (finalModules.length === 0) throw new Error('No modules generated');
      const invalidModule = finalModules.find(m => !m.title || !m.description || !m.content);
      if (invalidModule) throw new Error('Please complete all generated module fields before creating');

      const savedCourse = await courseService.createCourse({
        ...courseData,
        teacher_id: user?.id,
        is_published: publish
      });

      await Promise.all(finalModules.map((module, index) =>
        courseService.createModule({
          title: module.title,
          description: module.description,
          content: module.content,
          course_id: savedCourse.id,
          module_order: index + 1
        })
      ));

      // Reset
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Create New Course</h2>
          <button
            onClick={onCancel}
            className="text-muted hover:text-contrast transition-colors text-lg font-medium"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-6 bg-muted rounded-lg p-4">
          <div className="flex items-center flex-1">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              currentStep === 'details' ? 'accent-emerald text-contrast' : 'bg-muted text-muted'
            }`}>
              1
            </div>
            <div className="ml-3">
              <div className={`font-medium ${currentStep === 'details' ? 'text-contrast' : 'text-muted'}`}>Course Details</div>
            </div>
          </div>
          <div className="w-12 h-0.5 bg-card"></div>
          <div className="flex items-center flex-1">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              currentStep === 'modules' ? 'accent-emerald text-contrast' : 'bg-muted text-muted'
            }`}>
              2
            </div>
            <div className="ml-3">
              <div className={`font-medium ${currentStep === 'modules' ? 'text-contrast' : 'text-muted'}`}>Course Modules</div>
            </div>
          </div>
        </div>
      
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 'details' ? (
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-4">Course Details</h3>
              {/* Compact course summary card */}
              <div className="mb-4 p-3 bg-card border border-card rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-contrast">{courseData.title || 'Untitled Course'}</div>
                  <div className="text-xs text-muted">{courseData.category || 'No category'} • {courseData.difficulty}</div>
                  {courseData.description ? <div className="mt-2 text-xs text-muted line-clamp-2">{courseData.description}</div> : null}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted">Est. {courseData.estimated_hours ?? 0} hrs</div>
                  <button onClick={() => setShowAiModal(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">Create with AI</button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleCourseInputChange}
                    className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleCourseInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={courseData.category}
                      onChange={handleCourseInputChange}
                      className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={courseData.difficulty}
                      onChange={handleCourseInputChange}
                      className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={courseData.estimated_hours}
                      onChange={handleCourseInputChange}
                      min="0"
                      className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  Course Modules ({modules.length}/10)
                </h3>
                <button
                  type="button"
                  onClick={addModule}
                  disabled={modules.length >= 10}
                  className="px-4 py-2.5 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Module
                </button>
              </div>

              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={index} className="p-4 border border-card rounded-lg bg-card relative">
                    <div className="absolute top-4 right-4">
                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <h4 className="text-md font-medium text-primary mb-4">
                      Module {index + 1}
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-muted">
                          Title
                        </label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                          className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted">
                          Description
                        </label>
                        <textarea
                          value={module.description}
                          onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted">
                          Content
                        </label>
                        <textarea
                          value={module.content}
                          onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                          rows={4}
                          className="mt-1 block w-full rounded-md bg-card border-card text-contrast shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end items-center gap-3 mt-6">
            {/* Left side buttons */}
            <div className="flex-1 flex gap-3">
              {currentStep === 'modules' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 bg-transparent text-white border border-slate-600 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Back
                </button>
              )}
            </div>

            {/* Right side buttons */}
            <div className="flex gap-3">
              {/* Create with AI button - only on details step */}
              {currentStep === 'details' && (
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
                >
                  Create with AI
                </button>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 bg-transparent text-white border border-slate-600 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 text-white rounded-md font-semibold text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 ${
                  currentStep === 'details'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-500/20'
                }`}
              >
                {isLoading ? (
                  'Creating Course...'
                ) : currentStep === 'details' ? (
                  <span className="flex items-center gap-2">
                    Next Step
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                ) : (
                  'Create Course'
                )}
              </button>
            </div>
          </div>
        </form>

        {showAiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Create Course with AI</h3>
                <button onClick={() => { setShowAiModal(false); setAiPreviewModules(null); }} className="text-muted text-lg">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-muted">Course Title</label>
                  <input value={aiForm.title} onChange={(e) => setAiForm(prev => ({ ...prev, title: e.target.value }))} className="mt-1 block w-full rounded-md bg-card border-card text-contrast p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Category</label>
                  <input value={aiForm.category} onChange={(e) => setAiForm(prev => ({ ...prev, category: e.target.value }))} className="mt-1 block w-full rounded-md bg-card border-card text-contrast p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted">Description</label>
                  <textarea value={aiForm.description} onChange={(e) => setAiForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md bg-card border-card text-contrast p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Difficulty</label>
                  <select value={aiForm.difficulty} onChange={(e) => setAiForm(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))} className="mt-1 block w-full rounded-md bg-card border-card text-contrast p-2">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Estimated Hours</label>
                  <input type="number" value={aiForm.estimated_hours} onChange={(e) => setAiForm(prev => ({ ...prev, estimated_hours: Number(e.target.value) }))} min={0} className="mt-1 block w-full rounded-md bg-card border-card text-contrast p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Modules</label>
                  <input type="number" min={1} max={12} value={aiModuleCount} onChange={(e) => setAiModuleCount(Number(e.target.value))} className="mt-1 w-28 rounded-md bg-card border-card text-contrast p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted">Detail level</label>
                  <select value={aiDetailLevel} onChange={(e) => setAiDetailLevel(e.target.value as DetailLevel)} className="mt-1 block w-full rounded-md bg-card border-card text-contrast p-2">
                    <option value="brief">Brief</option>
                    <option value="normal">Normal</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>
              </div>

              {aiError && (
                <div className="mb-3 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">{aiError}</div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setShowAiModal(false); setAiPreviewModules(null); }} className="px-4 py-2 bg-transparent border border-neutral-800 rounded-md">Cancel</button>
                <button type="button" onClick={() => generateOutlineWithAi()} disabled={aiLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                  {aiLoading ? 'Generating…' : 'Generate Outline'}
                </button>
                <button type="button" onClick={() => { setAiPreviewModules(null); setAiForm({ title: '', description: '', category: '', difficulty: 'beginner', estimated_hours: 0 }); setShowAiModal(false); }} className="px-4 py-2 bg-neutral-900 text-white rounded-md">Reset</button>
              </div>

              {/* Preview generated modules (simple, visible) */}
              {aiPreviewModules && (
                <div className="mt-5 p-4 bg-muted rounded">
                  <h4 className="font-medium mb-2">Preview Modules</h4>
                  <div className="grid gap-3 max-h-56 overflow-y-auto">
                    {aiPreviewModules.map((m, i) => (
                      <div key={i} className="p-3 bg-card border border-card rounded">
                        <div className="font-semibold">{m.title}</div>
                        <div className="text-sm text-muted mt-1">{m.description}</div>
                        <div className="mt-2 text-sm">{m.content}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={publishAfterAi} onChange={(e) => setPublishAfterAi(e.target.checked)} /> Publish immediately</label>
                    <button type="button" onClick={() => confirmAiCreation(false)} disabled={isLoading} className="px-3 py-2 bg-amber-600 text-white rounded">Create Draft</button>
                    <button type="button" onClick={() => confirmAiCreation(true)} disabled={isLoading} className="px-3 py-2 bg-emerald-600 text-white rounded">Create & Publish</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { CourseCreation };