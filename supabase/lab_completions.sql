-- Create a table for tracking user lab completions
create table if not exists lab_completions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Assuming user_id is a string from your auth provider
  lab_id text not null,
  completed boolean default true,
  completed_at timestamptz default now(),
  created_at timestamptz default now(),
  
  -- Prevent duplicate entries for the same user and lab
  unique(user_id, lab_id)
);

-- Add RLS (Row Level Security) policies if needed
alter table lab_completions enable row level security;

-- Allow users to see their own completions
create policy "Users can view their own completions"
  on lab_completions for select
  using (auth.uid()::text = user_id);

-- Allow users to insert their own completions
create policy "Users can insert their own completions"
  on lab_completions for insert
  with check (auth.uid()::text = user_id);

-- Create an index for faster lookups based on user_id
create index if not exists idx_lab_completions_user_id on lab_completions(user_id);
