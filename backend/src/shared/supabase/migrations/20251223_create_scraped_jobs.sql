-- Create a new table for aggregated job listings
CREATE TABLE IF NOT EXISTS public.scraped_jobs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    company text NOT NULL,
    type text,
    salary_range text DEFAULT 'Competitive',
    location text DEFAULT 'Remote',
    requirements text[] DEFAULT '{}',
    link text UNIQUE NOT NULL,
    posted_at timestamp with time zone DEFAULT now(),
    source text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the Mission Board)
CREATE POLICY "Public read access for scraped_jobs"
ON public.scraped_jobs FOR SELECT
USING (true);

-- Allow service role / authenticated inserts (scraper will use this)
-- Note: If using Anon key for scraper, we might need a more permissive policy or use service role key
CREATE POLICY "Enable insert for all users"
ON public.scraped_jobs FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_link ON public.scraped_jobs(link);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_posted_at ON public.scraped_jobs(posted_at DESC);
