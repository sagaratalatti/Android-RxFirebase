import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleChatRequest } from '../server/chat-handler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await handleChatRequest(
    req.body as { prompt: string; systemContext: string },
    process.env as Record<string, string | undefined>
  );

  if ('error' in result) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(200).json({ content: result.content });
}
