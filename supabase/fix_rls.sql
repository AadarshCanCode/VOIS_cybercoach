-- DROP existing strict policies
drop policy if exists "Users can view their own completions" on lab_completions;
drop policy if exists "Users can insert their own completions" on lab_completions;

-- CREATE permissive policies for hackathon/demo mode
-- This allows the backend (using anon key) to Read/Write/Update any record
-- Necessary because backend might not have the user's JWT or Service Role Key
create policy "Enable all access" 
  on lab_completions 
  for all 
  using (true) 
  with check (true);
