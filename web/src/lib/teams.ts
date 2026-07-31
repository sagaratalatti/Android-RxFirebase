import type { Team, TeamMember } from '../types';
import type { AppBackup } from './backup';
import { getSupabase, isSupabaseConfigured } from './supabase';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase()!;
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (!memberships?.length) return [];

  const teamIds = memberships.map((m) => m.team_id);
  const { data: teams } = await supabase.from('teams').select('*').in('id', teamIds);

  return (teams ?? []) as Team[];
}

export async function createTeam(
  userId: string,
  name: string
): Promise<{ team?: Team; error?: string }> {
  if (!isSupabaseConfigured()) return { error: 'Teams require Supabase' };

  const supabase = getSupabase()!;
  const inviteCode = generateInviteCode();

  const { data: team, error } = await supabase
    .from('teams')
    .insert({ name, owner_id: userId, invite_code: inviteCode })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: userId,
    role: 'owner',
  });

  return { team: team as Team };
}

export async function joinTeamByCode(
  userId: string,
  inviteCode: string
): Promise<{ team?: Team; error?: string }> {
  if (!isSupabaseConfigured()) return { error: 'Teams require Supabase' };

  const supabase = getSupabase()!;
  const code = inviteCode.trim().toUpperCase();

  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('invite_code', code)
    .maybeSingle();

  if (error || !team) return { error: 'Invalid invite code' };

  const { error: memberError } = await supabase.from('team_members').upsert(
    { team_id: team.id, user_id: userId, role: 'member' },
    { onConflict: 'team_id,user_id' }
  );

  if (memberError) return { error: memberError.message };
  return { team: team as Team };
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase()!;
  const { data } = await supabase.from('team_members').select('*').eq('team_id', teamId);
  return (data ?? []) as TeamMember[];
}

export async function pushTeamData(
  teamId: string,
  backup: AppBackup
): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Not configured' };

  const supabase = getSupabase()!;
  const { error } = await supabase.from('team_sync_data').upsert(
    {
      team_id: teamId,
      data: backup,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'team_id' }
  );

  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Team data uploaded.' };
}

export async function pullTeamData(
  teamId: string
): Promise<{ success: boolean; message: string; data?: AppBackup }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Not configured' };

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from('team_sync_data')
    .select('data, updated_at')
    .eq('team_id', teamId)
    .maybeSingle();

  if (error) return { success: false, message: error.message };
  if (!data) return { success: true, message: 'No team data yet.' };

  return {
    success: true,
    message: 'Team data downloaded.',
    data: data.data as AppBackup,
  };
}

export async function leaveTeam(userId: string, teamId: string): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Not configured' };

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  return { error: error?.message };
}
