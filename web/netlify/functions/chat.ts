import type { Handler, HandlerEvent } from '@netlify/functions';
import { handleChatRequest, readJsonBody } from '../server/chat-handler';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const body = readJsonBody<{ prompt: string; systemContext: string }>(event.body ?? '');
  if (!body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const result = await handleChatRequest(body, process.env.OPENAI_API_KEY);

  if ('error' in result) {
    return { statusCode: result.status, body: JSON.stringify({ error: result.error }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: result.content }),
  };
};
