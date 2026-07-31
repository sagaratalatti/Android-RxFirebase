import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCheckoutSession } from '../server/stripe-handler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, userId, email } = req.body as {
    priceId: string;
    userId: string;
    email: string;
  };

  if (!priceId || !userId || !email) {
    return res.status(400).json({ error: 'Missing priceId, userId, or email' });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const result = await createCheckoutSession({ priceId, userId, email, origin });

  if (result.error) {
    return res.status(result.status ?? 500).json({ error: result.error });
  }

  return res.status(200).json({ url: result.url });
}
