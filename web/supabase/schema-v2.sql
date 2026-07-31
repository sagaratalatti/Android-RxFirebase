-- LoopForge schema extensions (run after schema.sql)
-- Teams, billing, and subscriptions

-- Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users on delete cascade not null,
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid references public.teams on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.team_sync_data (
  team_id uuid references public.teams on delete cascade primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_sync_data enable row level security;

-- Teams: authenticated users can read (needed for invite join)
create policy "Authenticated read teams"
  on public.teams for select
  using (auth.role() = 'authenticated');

create policy "Users create teams"
  on public.teams for insert
  with check (auth.uid() = owner_id);

create policy "Owners update teams"
  on public.teams for update
  using (auth.uid() = owner_id);

-- Team members
create policy "Members read team members"
  on public.team_members for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Users join teams"
  on public.team_members for insert
  with check (auth.uid() = user_id);

create policy "Users leave teams"
  on public.team_members for delete
  using (auth.uid() = user_id);

-- Anyone authenticated can look up teams by invite code (join flow)
-- (covered by "Authenticated read teams" above)

-- Team sync data
create policy "Members read team sync"
  on public.team_sync_data for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Members write team sync"
  on public.team_sync_data for insert
  with check (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Members update team sync"
  on public.team_sync_data for update
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

-- Subscriptions (billing)
create table if not exists public.subscriptions (
  user_id uuid references auth.users on delete cascade primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  status text not null default 'active',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role writes subscriptions via webhook (bypasses RLS)

create index if not exists idx_team_members_user on public.team_members (user_id);
create index if not exists idx_teams_invite on public.teams (invite_code);
