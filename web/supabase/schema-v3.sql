-- Team email invites (run after schema-v2.sql)

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams on delete cascade not null,
  email text not null,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  invited_by uuid references auth.users on delete cascade not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.team_invites enable row level security;

create policy "Team members read invites"
  on public.team_invites for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Team members create invites"
  on public.team_invites for insert
  with check (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Anyone read invite by token"
  on public.team_invites for select
  using (auth.role() = 'authenticated');

create policy "Invitee accepts invite"
  on public.team_invites for update
  using (
    auth.jwt() ->> 'email' = email
    or team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create index if not exists idx_team_invites_token on public.team_invites (token);
create index if not exists idx_team_invites_email on public.team_invites (email);
