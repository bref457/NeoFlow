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
