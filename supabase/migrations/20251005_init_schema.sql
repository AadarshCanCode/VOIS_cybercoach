/*
  # Initial schema for Cyber Coach (demo-friendly)

  Creates tables and columns expected by the frontend/services and adds
  permissive RLS policies suitable for local/demo use.
  Review and harden before production.
*/

-- Enable needed extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('student','teacher','admin')),
  password_hash text not null,
  level text default 'beginner' check (level in ('beginner','intermediate','advanced')),
  completed_assessment boolean default false,
  bio text default '',
  specialization text default '',
  experience_years text,
  created_at timestamptz default now()
);

alter table users enable row level security;

-- Demo policies (loose for development)
drop policy if exists "users_select_demo" on users;
drop policy if exists "users_insert_demo" on users;
drop policy if exists "users_update_self_demo" on users;

create policy "users_select_demo"
  on users for select
  to anon, authenticated
  using (true);

create policy "users_insert_demo"
  on users for insert
  to anon, authenticated
  with check (true);

create policy "users_update_self_demo"
  on users for update
  to authenticated
  using (auth.uid()::text = id::text)
  with check (auth.uid()::text = id::text);

-- COURSES
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'general',
  difficulty text default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  estimated_hours integer default 0,
  teacher_id uuid references users(id) on delete set null,
  is_published boolean default false,
  enrollment_count integer default 0,
  rating numeric default 0,
  created_at timestamptz default now()
);

alter table courses enable row level security;

drop policy if exists "courses_select_demo" on courses;
drop policy if exists "courses_insert_demo" on courses;
drop policy if exists "courses_update_demo" on courses;

create policy "courses_select_demo"
  on courses for select
  to anon, authenticated
  using (true);

create policy "courses_insert_demo"
  on courses for insert
  to authenticated
  with check (true);

create policy "courses_update_demo"
  on courses for update
  to authenticated
  using (true)
  with check (true);

-- COURSE MODULES
create table if not exists course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text default '',
  content text default '',
  video_url text,
  lab_url text,
  completed boolean default false,
  test_score integer,
  is_published boolean default false,
  module_order integer default 0,
  created_at timestamptz default now()
);

alter table course_modules enable row level security;

drop policy if exists "course_modules_select_demo" on course_modules;
drop policy if exists "course_modules_cud_demo" on course_modules;

create policy "course_modules_select_demo"
  on course_modules for select
  to anon, authenticated
  using (true);

create policy "course_modules_cud_demo"
  on course_modules for all
  to authenticated
  using (true)
  with check (true);

-- ENROLLMENTS
create table if not exists course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  enrolled_at timestamptz default now()
);

alter table course_enrollments enable row level security;

drop policy if exists "course_enrollments_select_demo" on course_enrollments;
drop policy if exists "course_enrollments_insert_demo" on course_enrollments;

create policy "course_enrollments_select_demo"
  on course_enrollments for select
  to anon, authenticated
  using (true);

create policy "course_enrollments_insert_demo"
  on course_enrollments for insert
  to authenticated
  with check (true);

-- USER PROGRESS
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  module_id uuid references course_modules(id) on delete set null,
  quiz_score integer default 0,
  completed boolean default false,
  updated_at timestamptz default now()
);

alter table user_progress enable row level security;

drop policy if exists "user_progress_select_demo" on user_progress;
drop policy if exists "user_progress_upsert_demo" on user_progress;

create policy "user_progress_select_demo"
  on user_progress for select
  to anon, authenticated
  using (true);

create policy "user_progress_upsert_demo"
  on user_progress for all
  to authenticated
  using (true)
  with check (true);

-- NOTES
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references users(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

alter table notes enable row level security;

drop policy if exists "notes_select_demo" on notes;
drop policy if exists "notes_cud_demo" on notes;

create policy "notes_select_demo"
  on notes for select
  to anon, authenticated
  using (true);

create policy "notes_cud_demo"
  on notes for all
  to authenticated
  using (true)
  with check (true);

-- Helpful indexes
create index if not exists idx_users_role on users(role);
create index if not exists idx_courses_teacher on courses(teacher_id);
create index if not exists idx_enroll_user on course_enrollments(user_id);
create index if not exists idx_enroll_course on course_enrollments(course_id);
create index if not exists idx_progress_user on user_progress(user_id);
create index if not exists idx_progress_course on user_progress(course_id);


