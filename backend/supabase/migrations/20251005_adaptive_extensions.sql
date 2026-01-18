-- Adaptive learning extensions: attempts, contexts, topics

-- assessment_responses: add attempt and context
alter table if exists assessment_responses
  add column if not exists attempt_id uuid,
  add column if not exists context text default 'initial';

create index if not exists idx_assessment_attempt on assessment_responses(attempt_id);
create index if not exists idx_assessment_user_context on assessment_responses(user_id, context);

-- user_progress: add topic and source for adaptive allocation
alter table if exists user_progress
  add column if not exists topic text,
  add column if not exists source text default 'adaptive';


