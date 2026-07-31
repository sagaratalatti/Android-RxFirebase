import type { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from '../server/supabase-admin';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { email } = JSON.parse(event.body ?? '{}') as { email: string };
  const adminEmails = getAdminEmails();

  if (!email || !adminEmails.includes(email.toLowerCase())) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Supabase admin not configured' }) };
  }

  const [usersRes, subsRes, reportsRes, teamsRes] = await Promise.all([
    supabase.from('user_sync_data').select('user_id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('plan'),
    supabase.from('shared_reports').select('id', { count: 'exact', head: true }),
    supabase.from('teams').select('id', { count: 'exact', head: true }),
  ]);

  const subscriptions = { free: 0, pro: 0, team: 0 };
  for (const row of subsRes.data ?? []) {
    const plan = (row as { plan: string }).plan;
    if (plan in subscriptions) {
      subscriptions[plan as keyof typeof subscriptions]++;
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      users: usersRes.count ?? 0,
      subscriptions,
      sharedReports: reportsRes.count ?? 0,
      teams: teamsRes.count ?? 0,
    }),
  };
};
