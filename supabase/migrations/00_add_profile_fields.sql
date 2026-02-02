-- Add new columns for enhanced profile information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS faculty text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS email_type text DEFAULT 'personal', -- 'vu' or 'personal'
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add check constraint for email_type
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_type_check 
CHECK (email_type IN ('vu', 'personal'));
