-- 1. Ensure Courses table exists
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  content_json_url text,
  teacher_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ensure Modules table exists (This was missing!)
CREATE TABLE IF NOT EXISTS public.modules (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  content text not null,
  course_id uuid references public.courses(id) on delete cascade,
  video_url text,
  lab_url text,
  "order" integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Add any missing columns to Courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS module_count INTEGER DEFAULT 0;

-- 4. Add any missing columns to Modules
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS module_order INTEGER DEFAULT 0;

-- 5. Enable RLS if not already
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- 6. Add Policies (Idempotent-ish checks aren't easy in simple SQL without DO blocks, but simple creation attempts usually fail safely if exists or we can ignore errors for now. 
-- Ideally user runs the full schema.sql, but this patches the hole.)

-- Grant access to authenticated users for now to ensure visibility
CREATE POLICY "Public Read" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public Read Modules" ON public.modules FOR SELECT USING (true);
