import type { Handler, HandlerEvent } from '@netlify/functions';
import { createCheckoutSession } from '../server/stripe-handler';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const body = JSON.parse(event.body ?? '{}') as {
    priceId: string;
    userId: string;
    email: string;
  };

  const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || '';
  const result = await createCheckoutSession({ ...body, origin });

  if (result.error) {
    return { statusCode: result.status ?? 500, body: JSON.stringify({ error: result.error }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: result.url }),
  };
};
