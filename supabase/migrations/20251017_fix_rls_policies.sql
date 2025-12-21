-- Fix RLS policies for development/demo environment
-- This allows operations for both anon and authenticated users

-- Drop existing restrictive policies for courses
drop policy if exists "courses_insert_demo" on courses;
drop policy if exists "courses_update_demo" on courses;
drop policy if exists "courses_delete_demo" on courses;

-- Create more permissive policies for development
create policy "courses_insert_permissive"
  on courses for insert
  to anon, authenticated
  with check (true);

create policy "courses_update_permissive"
  on courses for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "courses_delete_permissive"
  on courses for delete
  to anon, authenticated
  using (true);

-- Also update other tables that might have similar issues
drop policy if exists "course_modules_cud_demo" on course_modules;

create policy "course_modules_cud_permissive"
  on course_modules for all
  to anon, authenticated
  using (true)
  with check (true);

-- Fix user_progress table
drop policy if exists "user_progress_upsert_demo" on user_progress;

create policy "user_progress_upsert_permissive"
  on user_progress for all
  to anon, authenticated
  using (true)
  with check (true);

-- Fix notes table
drop policy if exists "notes_cud_demo" on notes;

create policy "notes_cud_permissive"
  on notes for all
  to anon, authenticated
  using (true)
  with check (true);

-- Fix course_enrollments
drop policy if exists "course_enrollments_insert_demo" on course_enrollments;
drop policy if exists "course_enrollments_update_demo" on course_enrollments;
drop policy if exists "course_enrollments_delete_demo" on course_enrollments;

create policy "course_enrollments_insert_permissive"
  on course_enrollments for insert
  to anon, authenticated
  with check (true);

create policy "course_enrollments_update_permissive"
  on course_enrollments for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "course_enrollments_delete_permissive"
  on course_enrollments for delete
  to anon, authenticated
  using (true);

-- Fix users table policies
drop policy if exists "users_update_self_demo" on users;
drop policy if exists "users_delete_demo" on users;

create policy "users_update_permissive"
  on users for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "users_delete_permissive"
  on users for delete
  to anon, authenticated
  using (true);