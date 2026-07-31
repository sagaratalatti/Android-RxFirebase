export type AIProvider = 'openai' | 'openrouter';

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
};

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  openrouter: 'openai/gpt-4o-mini',
};

export const API_ENDPOINTS: Record<AIProvider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

export const OPENROUTER_MODELS = [
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-flash-1.5',
  'meta-llama/llama-3.1-70b-instruct',
];

export function isValidApiKey(provider: AIProvider, key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed.startsWith('sk-')) {
    return false;
  }
  if (provider === 'openrouter') {
    return trimmed.startsWith('sk-or-') || trimmed.length > 12;
  }
  return true;
}

export function getRefererOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://loopforge.app';
}

export function getProviderHeaders(
  provider: AIProvider,
  apiKey: string,
  refererOrigin?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = refererOrigin ?? getRefererOrigin();
    headers['X-Title'] = 'LoopForge';
  }

  return headers;
}

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  max_tokens: number;
}

export async function callChatCompletions(
  provider: AIProvider,
  apiKey: string,
  body: ChatCompletionRequest,
  refererOrigin?: string
): Promise<{ content: string } | { error: string; status: number }> {
  const response = await fetch(API_ENDPOINTS[provider], {
    method: 'POST',
    headers: getProviderHeaders(provider, apiKey, refererOrigin),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      error:
        (error as { error?: { message?: string } }).error?.message ||
        `${PROVIDER_LABELS[provider]} API error: ${response.status}`,
      status: response.status,
    };
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return {
    content: data.choices[0]?.message?.content || 'No response generated.',
  };
}

export interface ServerAIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export function resolveServerAIConfig(
  env: Record<string, string | undefined>
): ServerAIConfig | null {
  const explicitProvider = env.AI_PROVIDER as AIProvider | undefined;
  const provider: AIProvider =
    explicitProvider === 'openrouter' || explicitProvider === 'openai'
      ? explicitProvider
      : env.OPENROUTER_API_KEY
        ? 'openrouter'
        : 'openai';

  const apiKey =
    provider === 'openrouter' ? env.OPENROUTER_API_KEY : env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    return null;
  }

  const model = env.AI_MODEL?.trim() || DEFAULT_MODELS[provider];
  return { provider, apiKey: apiKey.trim(), model };
}

export function getServerConfigHint(provider: AIProvider): string {
  return provider === 'openrouter' ? 'OPENROUTER_API_KEY' : 'OPENAI_API_KEY';
}
