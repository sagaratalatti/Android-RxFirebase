import type { Handler } from '@netlify/functions';
import { createPortalSession } from '../server/stripe-handler';
import { getSupabaseAdmin } from '../server/supabase-admin';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { userId } = JSON.parse(event.body ?? '{}') as { userId: string };
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Supabase admin not configured' }) };
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return { statusCode: 404, body: JSON.stringify({ error: 'No billing account found' }) };
  }

  const origin = event.headers.origin || '';
  const result = await createPortalSession({ customerId: data.stripe_customer_id, origin });

  if (result.error) {
    return { statusCode: result.status ?? 500, body: JSON.stringify({ error: result.error }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: result.url }),
  };
};
