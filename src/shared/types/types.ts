export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'teacher';
  avatar_url?: string;
  created_at?: string;
  certificates?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  teacher_name?: string;
  progress?: number;
  course_modules?: Module[];

  /* Additional metadata used in UI and services */
  is_published?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  enrollment_count?: number;
  rating?: number;
  estimated_hours?: number;
  created_at?: string;
  teacher_id?: string;
  category?: string;
  module_count?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  course_id: string;
  completed?: boolean;
  testScore?: number;
  videoUrl?: string;
  labUrl?: string;
  order?: number;

  /* Compatibility fields used elsewhere */
  module_order?: number;
  questions?: Question[];
  quiz?: any[]; // MongoDB quiz format
  type?: 'lecture' | 'quiz' | 'initial_assessment' | 'final_assessment';
}

export interface Certificate {
  id: string;
  user_id: string;
  course_name: string;
  issued_date: string;
  certificate_url: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}