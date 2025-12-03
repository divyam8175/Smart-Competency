const apiKey = process.env.GROK_API_KEY;
const model = process.env.GROK_MODEL || 'grok-2-latest';
const endpoint = process.env.GROK_BASE_URL || 'https://api.x.ai/v1/chat/completions';

export interface StructuredAiRequest<T> {
  instructions: string;
  schemaHint?: string;
  fallback: () => Promise<T> | T;
}

const extractJson = (input: string): string => {
  const start = input.indexOf('{');
  const end = input.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return input;
  }
  return input.slice(start, end + 1);
};

export const isAiEnabled = (): boolean => Boolean(apiKey);

export const requestStructuredAnalysis = async <T>({ instructions, schemaHint, fallback }: StructuredAiRequest<T>): Promise<T> => {
  if (!apiKey) {
    return await Promise.resolve(fallback());
  }

  try {
    const systemPrompt =
      'You are an AI assistant for a talent intelligence platform. Respond ONLY with valid JSON that matches the requested schema and avoid prose.';

    const userPrompt = `${instructions}${schemaHint ? `\nSchema Hint: ${schemaHint}` : ''}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Grok API error: ${response.status} ${text}`);
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(extractJson(content));
    return parsed as T;
  } catch (error) {
    console.warn('AI request failed, using fallback', error);
    return await Promise.resolve(fallback());
  }
};
