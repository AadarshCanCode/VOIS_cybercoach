import React from 'react';
import type { Course } from '@types';

interface CourseCreationProps {
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
  course?: Course | null;
}

export const CourseCreation: React.FC<CourseCreationProps> = ({ onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold text-white mb-4">Create Course</h2>
        <p className="text-slate-400 mb-6">Course creation logic pending implementation.</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};