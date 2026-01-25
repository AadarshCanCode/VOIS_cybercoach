-- Create quiz_attempts table for tracking assessment scores and results
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb, -- Stores user selected options { "questionId": "optionId" }
  proctoring_session_id text, -- Link to Mongo ProctoringLog attemptId
  violation_count integer DEFAULT 0,
  completed_at timestamp with time zone DEFAULT now(),
  
  -- Prevent multiple passing attempts if desired (optional, allowing multiple for now)
  -- UNIQUE(student_id, module_id) 
  CONSTRAINT score_range CHECK (score >= 0 AND score <= 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module_id ON public.quiz_attempts(module_id);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can read own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);
