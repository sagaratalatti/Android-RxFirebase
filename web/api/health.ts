import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServerHealth } from '../server/chat-handler';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json(getServerHealth(process.env as Record<string, string | undefined>));
}
