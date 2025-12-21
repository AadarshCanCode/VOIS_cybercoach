import React, { useState, useEffect } from 'react';
import type { Module } from '@types';
import { courseService } from '@services/courseService';

interface ModuleManagerProps {
  courseId: string;
}

export const ModuleManager: React.FC<ModuleManagerProps> = ({ courseId }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string>('');
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    content: ''
  });

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    try {
      const moduleData = await courseService.getModulesByCourse(courseId);
      setModules(moduleData || []);
    } catch (err) {
      console.error('Failed to load modules', err);
      setError('Failed to load modules');
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modules.length >= 10) {
        setError('Maximum limit of 10 modules reached');
        return;
      }

      await courseService.createModule({
        ...(newModule as Partial<Module>),
        course_id: courseId
      });

      setNewModule({ title: '', description: '', content: '' });
      loadModules();
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">
          Course Modules ({modules.length}/10)
        </h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
          {error}
        </div>
      )}

      {/* Module List */}
      <div className="space-y-3">
        {modules.map((module, index) => (
          <div 
            key={module.id} 
            className="p-4 border border-card rounded-lg bg-muted transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-muted">#{index + 1}</span>
                <h4 className="font-medium text-primary">{module.title}</h4>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">{module.description}</p>
          </div>
        ))}
      </div>

      {/* Add Module Form */}
      {modules.length < 10 && (
        <form onSubmit={handleAddModule} className="space-y-4 border-t pt-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">
              Module Title
            </label>
            <input
              type="text"
              value={newModule.title}
              onChange={(e) => setNewModule({...newModule, title: e.target.value})}
              className="w-full px-3 py-2 border border-card rounded-md bg-card text-contrast focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({...newModule, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={newModule.content}
              onChange={(e) => setNewModule({...newModule, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={5}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 btn-primary rounded-md transition-colors"
          >
            Add Module
          </button>
        </form>
      )}
    </div>
  );
};

export default ModuleManager;