-- Add module_count column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS module_count INTEGER DEFAULT 0;

-- Optional: Update existing rows that have content_json_url (approximate, since we can't read JSON in SQL easily without pg_jsonschema, but checking if we can default to something)
-- Actually, we can't easily count modules inside the remote JSON URL from SQL.
-- We will leave existing ones as 0 or null and expect them to be updated on next save.
