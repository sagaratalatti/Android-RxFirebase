import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../server/supabase-admin';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body as { email: string; userId: string };
  const adminEmails = getAdminEmails();

  if (!email || !adminEmails.includes(email.toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase admin not configured' });
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

  return res.status(200).json({
    users: usersRes.count ?? 0,
    subscriptions,
    sharedReports: reportsRes.count ?? 0,
    teams: teamsRes.count ?? 0,
  });
}
