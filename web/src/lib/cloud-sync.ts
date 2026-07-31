import type { AppBackup } from './backup';
import { getSupabase, isSupabaseConfigured } from './supabase';

export interface CloudSyncResult {
  success: boolean;
  message: string;
  updatedAt?: string;
}

export async function pullFromCloud(userId: string): Promise<CloudSyncResult & { data?: AppBackup }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Cloud sync not configured.' };
  }

  const supabase = getSupabase()!;

  const { data, error } = await supabase
    .from('user_sync_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return { success: true, message: 'No cloud data found — your local data is up to date.' };
  }

  return {
    success: true,
    message: 'Cloud data downloaded.',
    data: data.data as AppBackup,
    updatedAt: data.updated_at,
  };
}

export async function pushToCloud(userId: string, backup: AppBackup): Promise<CloudSyncResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Cloud sync not configured.' };
  }

  const supabase = getSupabase()!;

  const { error } = await supabase.from('user_sync_data').upsert(
    {
      user_id: userId,
      data: backup,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Data synced to cloud.', updatedAt: new Date().toISOString() };
}

export interface SharedReportPayload {
  title: string;
  moduleId: string;
  companyName: string;
  moduleTitle: string;
  iterations: { loopNumber: number; name: string; response: string }[];
  finalOutput: string;
}

export interface SharedReportRecord {
  id: string;
  title: string;
  module_id: string;
  company_name: string;
  module_title: string;
  content: {
    iterations: { loopNumber: number; name: string; response: string }[];
    finalOutput: string;
  };
  created_at: string;
}

export async function createSharedReport(
  userId: string,
  payload: SharedReportPayload
): Promise<{ success: boolean; message: string; shareId?: string; shareUrl?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Sharing requires Supabase configuration.' };
  }

  const supabase = getSupabase()!;

  const { data, error } = await supabase
    .from('shared_reports')
    .insert({
      user_id: userId,
      title: payload.title,
      module_id: payload.moduleId,
      company_name: payload.companyName,
      module_title: payload.moduleTitle,
      content: {
        iterations: payload.iterations,
        finalOutput: payload.finalOutput,
      },
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  const shareUrl = `${window.location.origin}/share/${data.id}`;
  return { success: true, message: 'Share link created.', shareId: data.id, shareUrl };
}

export async function getSharedReport(
  shareId: string
): Promise<{ success: boolean; message: string; report?: SharedReportRecord }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Sharing not configured.' };
  }

  const supabase = getSupabase()!;

  const { data, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('id', shareId)
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data) {
    return { success: false, message: 'Report not found or link has expired.' };
  }

  return { success: true, message: 'OK', report: data as SharedReportRecord };
}
