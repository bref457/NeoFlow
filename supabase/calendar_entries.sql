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
