-- Create Questions Table
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  question_text text not null,
  options jsonb not null, -- Array of strings
  correct_answer integer not null, -- Index of correct option (0-3)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Exam Attempts Table
create table if not exists public.user_exams (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  score integer not null, -- Number of correct answers
  total_questions integer not null,
  passed boolean default false,
  proctoring_logs jsonb, -- Store logs of tab switching etc.
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.questions enable row level security;
alter table public.user_exams enable row level security;

-- Questions are viewable by everyone (or just students)
create policy "Questions are viewable by everyone" on public.questions
  for select using (true);

-- User Exams policies
create policy "Users can view own exams" on public.user_exams
  for select using (auth.uid() = user_id);

create policy "Users can insert own exams" on public.user_exams
  for insert with check (auth.uid() = user_id);
