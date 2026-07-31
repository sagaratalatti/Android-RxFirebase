-- LoopForge Supabase schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- User cloud sync (one row per user)
create table if not exists public.user_sync_data (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_sync_data enable row level security;

create policy "Users read own sync data"
  on public.user_sync_data for select
  using (auth.uid() = user_id);

create policy "Users insert own sync data"
  on public.user_sync_data for insert
  with check (auth.uid() = user_id);

create policy "Users update own sync data"
  on public.user_sync_data for update
  using (auth.uid() = user_id);

-- Public shared reports (read-only links)
create table if not exists public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  module_id text not null,
  module_title text not null default '',
  company_name text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shared_reports enable row level security;

create policy "Anyone can read shared reports"
  on public.shared_reports for select
  using (true);

create policy "Authenticated users can create shares"
  on public.shared_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own shares"
  on public.shared_reports for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_shared_reports_created on public.shared_reports (created_at desc);
