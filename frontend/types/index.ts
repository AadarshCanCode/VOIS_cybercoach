export interface User {
  id: string;
  email: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  role?: 'student' | 'teacher' | 'admin';
  completedAssessment: boolean;
  courseProgress: Record<string, number>;
  certificates: string[];
  created_at?: string | Date;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  course_id: string;
  module_order: number;
  is_published: boolean;
  videoUrl?: string;
  labUrl?: string;
  completed?: boolean;
  testScore?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  // DB may return modules under `course_modules` when using supabase relation selects
  modules?: Module[];
  course_modules?: Module[];

  // Additional DB fields
  teacher_id?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_published?: boolean;
  enrollment_count?: number;
  rating?: number;
  estimated_hours?: number;
  created_at?: string | Date;

  // UI helpers
  unlocked?: boolean;
  progress?: number;
}

export interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tools: string[];
  instructions: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}
export * from "./types";
