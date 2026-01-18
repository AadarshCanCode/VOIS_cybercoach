-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- Set up auth schema
create schema if not exists auth;

-- Enable RLS
alter table auth.users enable row level security;

-- Create tables
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  content_json_url text,
  teacher_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.modules (
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

create table if not exists public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  completed boolean default false,
  quiz_score integer,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, module_id)
);

create table if not exists public.assessment_responses (
  id uuid default uuid_generate_v4() primary key,
  attempt_id uuid,
  user_id uuid references auth.users(id) on delete cascade,
  question_id text not null,
  selected_answer integer not null,
  confidence_level integer not null,
  is_correct boolean not null,
  time_taken_seconds integer not null,
  context text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_name text not null,
  issued_date timestamp with time zone not null,
  certificate_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.user_progress enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.user_certificates enable row level security;

-- Courses policies
create policy "Public courses are viewable by everyone"
  on public.courses for select
  using (true);

create policy "Teachers can insert courses"
  on public.courses for insert
  with check (auth.uid() in (
    select id from auth.users where role = 'teacher'
  ));

create policy "Teachers can update their own courses"
  on public.courses for update
  using (auth.uid() = teacher_id);

-- Modules policies
create policy "Everyone can view modules"
  on public.modules for select
  using (true);

create policy "Teachers can insert modules to their courses"
  on public.modules for insert
  with check (
    exists (
      select 1 from public.courses 
      where id = course_id 
      and teacher_id = auth.uid()
    )
  );

create policy "Teachers can update modules in their courses"
  on public.modules for update
  using (
    exists (
      select 1 from public.courses 
      where id = course_id 
      and teacher_id = auth.uid()
    )
  );

-- User progress policies
create policy "Users can view their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- Assessment responses policies
create policy "Users can view their own responses"
  on public.assessment_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own responses"
  on public.assessment_responses for insert
  with check (auth.uid() = user_id);

-- Certificates policies
create policy "Users can view their own certificates"
  on public.user_certificates for select
  using (auth.uid() = user_id);

create policy "Users can insert their own certificates"
  on public.user_certificates for insert
  with check (auth.uid() = user_id);

-- Functions
create or replace function public.get_module_completion(course_id uuid, user_id uuid)
returns table (
  completed_count bigint,
  total_count bigint,
  progress numeric
)
language sql
security definer
as $$
  with counts as (
    select 
      count(*) filter (where up.completed) as completed,
      count(*) as total
    from public.modules m
    left join public.user_progress up 
      on up.module_id = m.id 
      and up.user_id = user_id
    where m.course_id = course_id
  )
  select
    completed,
    total,
    case 
      when total = 0 then 0
      else round((completed::numeric / total::numeric) * 100, 2)
    end as progress
  from counts;
$$;