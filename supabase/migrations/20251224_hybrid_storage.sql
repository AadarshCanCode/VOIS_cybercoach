-- Migration: Hybrid Storage Setup
-- Date: 2025-12-24

-- 1. Add column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS content_json_url TEXT;

-- 2. Create Storage Bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('course-content', 'course-content', true, false, 52428800, ARRAY['application/json'])
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for Storage
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course-content' );

-- Allow authenticated users (teachers) to upload
CREATE POLICY "Teacher Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-content' 
  AND auth.role() = 'authenticated'
);

-- Allow teachers to update their own files (optional, depending on how we name files)
CREATE POLICY "Teacher Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-content' 
  AND auth.role() = 'authenticated'
);
