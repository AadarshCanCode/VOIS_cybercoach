-- Add is_published column to courses table to fix visibility logic
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Add is_published column to modules table as well if missing
ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
