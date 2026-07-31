import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    configured: Boolean(process.env.OPENAI_API_KEY),
    mode: 'server',
  });
}
