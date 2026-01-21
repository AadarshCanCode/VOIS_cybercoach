-- Create lab_completions table for tracking lab completion status
CREATE TABLE IF NOT EXISTS public.lab_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id text NOT NULL,
  completed_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(student_id, lab_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_completions_student_id ON public.lab_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_lab_completions_lab_id ON public.lab_completions(lab_id);

-- Enable RLS
ALTER TABLE public.lab_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Students can read their own lab completions
CREATE POLICY "Students can read own lab completions"
  ON public.lab_completions
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own lab completions
CREATE POLICY "Students can insert own lab completions"
  ON public.lab_completions
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own lab completions (if needed)
CREATE POLICY "Students can update own lab completions"
  ON public.lab_completions
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Admins can read all lab completions
CREATE POLICY "Admins can read all lab completions"
  ON public.lab_completions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

