alter table public.tasks
  add column if not exists due_at timestamptz;

create index if not exists tasks_user_id_due_at_idx
  on public.tasks (user_id, due_at asc)
  where due_at is not null;
