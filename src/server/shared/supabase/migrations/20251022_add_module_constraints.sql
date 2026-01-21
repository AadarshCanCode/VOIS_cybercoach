-- Add module_order column and constraints
ALTER TABLE course_modules
ADD COLUMN IF NOT EXISTS module_order INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create function to check module count
CREATE OR REPLACE FUNCTION check_module_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM course_modules
    WHERE course_id = NEW.course_id
  ) >= 10 THEN
    RAISE EXCEPTION 'Maximum limit of 10 modules per course reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce module limit
DROP TRIGGER IF EXISTS enforce_module_limit ON course_modules;
CREATE TRIGGER enforce_module_limit
  BEFORE INSERT ON course_modules
  FOR EACH ROW
  EXECUTE FUNCTION check_module_limit();

-- Add index for faster module queries
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);

-- Add index for ordered module queries
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, module_order);