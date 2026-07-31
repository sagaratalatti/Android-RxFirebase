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
  apiKey: string | undefined
): Promise<ChatSuccess | ChatError> {
  if (!apiKey) {
    return {
      error: 'Server AI not configured. Set OPENAI_API_KEY on your deployment.',
      status: 503,
    };
  }

  if (!body.prompt?.trim() || !body.systemContext?.trim()) {
    return { error: 'Missing prompt or systemContext', status: 400 };
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
        { role: 'system', content: body.systemContext },
        { role: 'user', content: body.prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      error:
        (error as { error?: { message?: string } }).error?.message ||
        `OpenAI API error: ${response.status}`,
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

export function readJsonBody<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
