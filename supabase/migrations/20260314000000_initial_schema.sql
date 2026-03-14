create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#A8E6CF',
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists color text not null default '#A8E6CF';
alter table public.projects
  add column if not exists archived_at timestamptz;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  done boolean not null default false,
  archived_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists archived_at timestamptz;
alter table public.tasks
  add column if not exists priority text not null default 'medium';
alter table public.tasks
  drop constraint if exists tasks_priority_check;
alter table public.tasks
  add constraint tasks_priority_check check (priority in ('low', 'medium', 'high'));

create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);
create index if not exists projects_user_id_archived_at_idx
  on public.projects (user_id, archived_at);

create index if not exists tasks_project_id_created_at_idx
  on public.tasks (project_id, created_at desc);

create index if not exists tasks_user_id_idx
  on public.tasks (user_id);

create index if not exists tasks_user_id_due_at_idx
  on public.tasks (user_id, due_at asc)
  where due_at is not null;
create index if not exists tasks_user_id_archived_at_idx
  on public.tasks (user_id, archived_at);

alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own"
on public.projects
for select
to authenticated
using (auth.uid() = user_id);

create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "projects_update_own"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own_project_match" on public.tasks;
drop policy if exists "tasks_update_own_project_match" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

create policy "tasks_insert_own_project_match"
on public.tasks
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = tasks.project_id
      and p.user_id = auth.uid()
  )
);

create policy "tasks_update_own_project_match"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = tasks.project_id
      and p.user_id = auth.uid()
  )
);

create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);
create extension if not exists "pgcrypto";

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notes
  add column if not exists archived_at timestamptz;

alter table public.notes enable row level security;

drop policy if exists "Users can select own notes" on public.notes;
create policy "Users can select own notes"
on public.notes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes" on public.notes;
create policy "Users can insert own notes"
on public.notes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on public.notes;
create policy "Users can update own notes"
on public.notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notes" on public.notes;
create policy "Users can delete own notes"
on public.notes
for delete
to authenticated
using (auth.uid() = user_id);

alter table public.notes add column if not exists category text default 'note'
  check (category in ('note', 'feedback', 'brainstorming', 'infra', 'claude'));
alter table public.notes add column if not exists app_name text;
alter table public.notes add column if not exists source text;

create index if not exists notes_user_id_created_at_idx
on public.notes (user_id, created_at desc);
create index if not exists notes_user_id_archived_at_idx
on public.notes (user_id, archived_at);
create index if not exists notes_user_id_category_idx
on public.notes (user_id, category);
create table if not exists public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  note text,
  archived_at timestamptz,
  recurrence_rule text not null default 'none' check (recurrence_rule in ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  recurrence_until timestamptz,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.calendar_entries
  add column if not exists archived_at timestamptz;
alter table public.calendar_entries
  add column if not exists recurrence_rule text not null default 'none';
alter table public.calendar_entries
  add column if not exists recurrence_until timestamptz;
alter table public.calendar_entries
  drop constraint if exists calendar_entries_recurrence_rule_check;
alter table public.calendar_entries
  add constraint calendar_entries_recurrence_rule_check check (recurrence_rule in ('none', 'daily', 'weekly', 'monthly', 'yearly'));

create index if not exists calendar_entries_user_id_starts_at_idx
  on public.calendar_entries (user_id, starts_at asc);
create index if not exists calendar_entries_user_id_archived_at_idx
  on public.calendar_entries (user_id, archived_at);

alter table public.calendar_entries enable row level security;

drop policy if exists "calendar_entries_select_own" on public.calendar_entries;
drop policy if exists "calendar_entries_insert_own" on public.calendar_entries;
drop policy if exists "calendar_entries_update_own" on public.calendar_entries;
drop policy if exists "calendar_entries_delete_own" on public.calendar_entries;

create policy "calendar_entries_select_own"
on public.calendar_entries
for select
to authenticated
using (auth.uid() = user_id);

create policy "calendar_entries_insert_own"
on public.calendar_entries
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "calendar_entries_update_own"
on public.calendar_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "calendar_entries_delete_own"
on public.calendar_entries
for delete
to authenticated
using (auth.uid() = user_id);
alter table public.tasks
  add column if not exists due_at timestamptz;

create index if not exists tasks_user_id_due_at_idx
  on public.tasks (user_id, due_at asc)
  where due_at is not null;
