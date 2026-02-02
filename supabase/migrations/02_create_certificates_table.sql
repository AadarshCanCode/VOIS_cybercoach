-- Create courses table if it doesn't exist (it is referenced by certificates)
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for courses" ON public.courses FOR SELECT USING (true);


-- Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES auth.users(id) NOT NULL,
  course_id uuid REFERENCES public.courses(id), -- Nullable if course is not in DB? Ideally valid FK
  issued_at timestamptz DEFAULT now(),
  certificate_url text, -- The URL we need to save!
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Add certificate_url column if it relies on an older version of the table
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS certificate_url text;

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policies
-- Student can view their own certificates
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = student_id);

-- Student can insert their own certificates (needed for the modal logic)
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;
CREATE POLICY "Users can insert own certificates" 
ON public.certificates FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Student can update their own certificates (e.g. if regenerated)
DROP POLICY IF EXISTS "Users can update own certificates" ON public.certificates;
CREATE POLICY "Users can update own certificates" 
ON public.certificates FOR UPDATE 
USING (auth.uid() = student_id);


-- Create storage bucket for certificates if not exists
-- Note: SQL-based bucket creation is specific to Supabase functions, doing it via API is standard but we can try inserting into storage.buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');
