import {
  callChatCompletions,
  DEFAULT_MODELS,
  isValidApiKey,
  PROVIDER_LABELS,
  type AIProvider,
} from './ai-provider';

export type { AIProvider } from './ai-provider';
export type AIMode = 'demo' | 'client' | 'server';

const API_KEY_STORAGE = 'loopforge_api_key';
const LEGACY_API_KEY_STORAGE = 'loopforge_openai_key';
const AI_MODE_STORAGE = 'loopforge_ai_mode';
const AI_PROVIDER_STORAGE = 'loopforge_ai_provider';
const AI_MODEL_STORAGE = 'loopforge_ai_model';

let serverAvailable: boolean | null = null;
let serverProvider: AIProvider | null = null;
let serverModel: string | null = null;

function migrateLegacyApiKey(): void {
  if (!localStorage.getItem(API_KEY_STORAGE)) {
    const legacy = localStorage.getItem(LEGACY_API_KEY_STORAGE);
    if (legacy) {
      localStorage.setItem(API_KEY_STORAGE, legacy);
    }
  }
}

migrateLegacyApiKey();

export function getAIProvider(): AIProvider {
  const stored = localStorage.getItem(AI_PROVIDER_STORAGE) as AIProvider | null;
  if (stored === 'openai' || stored === 'openrouter') {
    return stored;
  }
  return 'openai';
}

export function setAIProvider(provider: AIProvider): void {
  localStorage.setItem(AI_PROVIDER_STORAGE, provider);
  serverAvailable = null;
}

export function getAIModel(): string {
  const stored = localStorage.getItem(AI_MODEL_STORAGE);
  if (stored?.trim()) {
    return stored.trim();
  }
  return DEFAULT_MODELS[getAIProvider()];
}

export function setAIModel(model: string): void {
  const trimmed = model.trim();
  if (trimmed) {
    localStorage.setItem(AI_MODEL_STORAGE, trimmed);
  } else {
    localStorage.removeItem(AI_MODEL_STORAGE);
  }
}

export function getAIMode(): AIMode {
  const stored = localStorage.getItem(AI_MODE_STORAGE) as AIMode | null;
  if (stored === 'server' || stored === 'client' || stored === 'demo') {
    return stored;
  }
  return getStoredApiKey() ? 'client' : 'demo';
}

export function setAIMode(mode: AIMode): void {
  localStorage.setItem(AI_MODE_STORAGE, mode);
  if (mode !== 'client') {
    serverAvailable = null;
  }
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setStoredApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
    localStorage.removeItem(LEGACY_API_KEY_STORAGE);
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(LEGACY_API_KEY_STORAGE);
  }
}

export async function checkServerAI(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      serverAvailable = false;
      serverProvider = null;
      serverModel = null;
      return false;
    }
    const data = (await response.json()) as {
      configured?: boolean;
      provider?: AIProvider;
      model?: string;
    };
    serverAvailable = Boolean(data.configured);
    serverProvider =
      data.provider === 'openrouter' || data.provider === 'openai'
        ? data.provider
        : null;
    serverModel = data.model ?? null;
    return serverAvailable;
  } catch {
    serverAvailable = false;
    serverProvider = null;
    serverModel = null;
    return false;
  }
}

export function isServerAIMarkedAvailable(): boolean {
  return serverAvailable === true;
}

export function getServerProvider(): AIProvider | null {
  return serverProvider;
}

export function getServerModel(): string | null {
  return serverModel;
}

export function isAIConfigured(): boolean {
  const mode = getAIMode();
  if (mode === 'server') {
    return serverAvailable === true;
  }
  if (mode === 'client') {
    const key = getStoredApiKey();
    return Boolean(key && isValidApiKey(getAIProvider(), key));
  }
  return false;
}

export function getAIStatusLabel(): string {
  const mode = getAIMode();

  if (mode === 'server') {
    if (!serverAvailable) {
      return 'Server AI selected — checking availability…';
    }
    const provider = serverProvider ?? 'openai';
    const model = serverModel ?? DEFAULT_MODELS[provider];
    return `Live AI via server proxy (${PROVIDER_LABELS[provider]}, ${model})`;
  }

  if (mode === 'client' && isAIConfigured()) {
    const provider = getAIProvider();
    return `Live AI via browser key (${PROVIDER_LABELS[provider]}, ${getAIModel()})`;
  }

  return 'Demo mode — sample outputs';
}

async function generateViaClient(prompt: string, systemContext: string): Promise<string> {
  const apiKey = getStoredApiKey();
  const provider = getAIProvider();

  if (!apiKey) {
    throw new Error(`${PROVIDER_LABELS[provider]} API key not configured`);
  }

  const result = await callChatCompletions(provider, apiKey, {
    model: getAIModel(),
    messages: [
      { role: 'system', content: systemContext },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  if ('error' in result) {
    throw new Error(result.error);
  }

  return result.content;
}

async function generateViaServer(prompt: string, systemContext: string): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemContext }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: string }).error || `Server API error: ${response.status}`
    );
  }

  const data = (await response.json()) as { content: string };
  return data.content || 'No response generated.';
}

export async function generateAIResponse(
  prompt: string,
  systemContext: string
): Promise<string> {
  const mode = getAIMode();

  if (mode === 'server') {
    return generateViaServer(prompt, systemContext);
  }

  if (mode === 'client') {
    return generateViaClient(prompt, systemContext);
  }

  throw new Error('AI not configured');
}
