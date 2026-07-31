export type AIMode = 'demo' | 'client' | 'server';

const API_KEY_STORAGE = 'loopforge_openai_key';
const AI_MODE_STORAGE = 'loopforge_ai_mode';

let serverAvailable: boolean | null = null;

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
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

export async function checkServerAI(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      serverAvailable = false;
      return false;
    }
    const data = (await response.json()) as { configured?: boolean };
    serverAvailable = Boolean(data.configured);
    return serverAvailable;
  } catch {
    serverAvailable = false;
    return false;
  }
}

export function isServerAIMarkedAvailable(): boolean {
  return serverAvailable === true;
}

export function isAIConfigured(): boolean {
  const mode = getAIMode();
  if (mode === 'server') {
    return serverAvailable === true;
  }
  if (mode === 'client') {
    const key = getStoredApiKey();
    return Boolean(key && key.startsWith('sk-'));
  }
  return false;
}

export function getAIStatusLabel(): string {
  const mode = getAIMode();
  if (mode === 'server') {
    return serverAvailable
      ? 'Live AI via server proxy (GPT-4o-mini)'
      : 'Server AI selected — checking availability…';
  }
  if (mode === 'client' && isAIConfigured()) {
    return 'Live AI via browser key (GPT-4o-mini)';
  }
  return 'Demo mode — sample outputs';
}

async function generateViaClient(prompt: string, systemContext: string): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: { message?: string } }).error?.message ||
        `API error: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content || 'No response generated.';
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
