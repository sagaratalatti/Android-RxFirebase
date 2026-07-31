import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      configured: Boolean(process.env.OPENAI_API_KEY),
      mode: 'server',
    }),
  };
};
