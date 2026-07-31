import {
  callChatCompletions,
  resolveServerAIConfig,
} from '../src/lib/ai-provider';

export interface ChatRequest {
  prompt: string;
  systemContext: string;
}

export interface ChatSuccess {
  content: string;
}

export interface ChatError {
  error: string;
  status: number;
}

export async function handleChatRequest(
  body: ChatRequest,
  env: Record<string, string | undefined>
): Promise<ChatSuccess | ChatError> {
  const config = resolveServerAIConfig(env);

  if (!config) {
    return {
      error:
        'Server AI not configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY on your deployment.',
      status: 503,
    };
  }

  if (!body.prompt?.trim() || !body.systemContext?.trim()) {
    return { error: 'Missing prompt or systemContext', status: 400 };
  }

  const result = await callChatCompletions(
    config.provider,
    config.apiKey,
    {
      model: config.model,
      messages: [
        { role: 'system', content: body.systemContext },
        { role: 'user', content: body.prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    },
    env.APP_URL
  );

  if ('error' in result) {
    return { error: result.error, status: result.status };
  }

  return { content: result.content };
}

export function getServerHealth(env: Record<string, string | undefined>) {
  const config = resolveServerAIConfig(env);
  return {
    configured: Boolean(config),
    provider: config?.provider ?? null,
    model: config?.model ?? null,
    mode: 'server' as const,
  };
}

export { resolveServerAIConfig };

export function readJsonBody<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
