import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPortalSession } from '../server/stripe-handler';
import { getSupabaseAdmin } from '../server/supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body as { userId: string };
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase admin not configured' });
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return res.status(404).json({ error: 'No billing account found' });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const result = await createPortalSession({
    customerId: data.stripe_customer_id,
    origin,
  });

  if (result.error) {
    return res.status(result.status ?? 500).json({ error: result.error });
  }

  return res.status(200).json({ url: result.url });
}
