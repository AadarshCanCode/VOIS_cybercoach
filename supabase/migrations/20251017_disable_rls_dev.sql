-- DEVELOPMENT ONLY: Temporarily disable RLS for all tables
-- WARNING: This is NOT secure and should NOT be used in production

-- Disable RLS on all tables for development
alter table users disable row level security;
alter table courses disable row level security;
alter table course_modules disable row level security;
alter table course_enrollments disable row level security;
alter table user_progress disable row level security;
alter table notes disable row level security;

-- Note: To re-enable RLS later, use:
-- alter table [table_name] enable row level security;