import type { Handler } from '@netlify/functions';
import { getServerHealth } from '../../server/chat-handler';

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      getServerHealth(process.env as Record<string, string | undefined>)
    ),
  };
};
