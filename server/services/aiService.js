/**
 * Dynamic AI Service — OpenAI SDK style
 * Works with any OpenAI-compatible provider (OpenRouter, Groq, OpenAI, etc.)
 *
 * .env keys:
 *   AI_API_KEY   — your provider API key
 *   AI_BASE_URL  — provider base URL  (default: https://openrouter.ai/api/v1)
 *   AI_MODEL     — model ID           (default: meta-llama/llama-3.3-70b-instruct:free)
 */

const { OpenAI } = require('openai');

const AI_BASE_URL = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

if (!AI_API_KEY) {
  console.warn('[aiService] AI_API_KEY is not set. AI features will not work.');
}

const openai = new OpenAI({
  apiKey: AI_API_KEY || 'not-set',
  baseURL: AI_BASE_URL,
});

// ─── helpers ────────────────────────────────────────────────────────────────

const callLLM = async (systemPrompt, userPrompt) => {
  if (!AI_API_KEY) {
    throw Object.assign(
      new Error('AI service is not configured. Please set AI_API_KEY in your environment.'),
      { code: 'AI_NOT_CONFIGURED' }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    return completion.choices[0].message.content ?? '';
  } catch (error) {
    if (error?.status === 429 || error?.message?.includes('429')) {
      throw Object.assign(
        new Error('AI quota exceeded. The free tier limit has been reached. Please try again later.'),
        { code: 'AI_QUOTA_EXCEEDED' }
      );
    }
    throw Object.assign(
      new Error(`AI API error: ${error.message}`),
      { code: 'AI_API_ERROR' }
    );
  }
};

const parseAIResponse = (text) => {
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw Object.assign(
      new Error('AI returned an invalid response. Please try again.'),
      { code: 'INVALID_AI_RESPONSE' }
    );
  }
};

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Generate blog post title + HTML content.
 * Returns: { title: string, content: string }
 */
const generatePostContent = async (topic) => {
  const system = 'You are a professional blog post writer. Return ONLY raw JSON — no markdown, no code fences.';
  const user = `Generate a catchy title and engaging HTML content for a blog post about: "${topic}".
Return a valid JSON object exactly like this:
{
  "title": "Your Title Here",
  "content": "<p>Your HTML content here...</p>"
}`;

  try {
    const text = await callLLM(system, user);
    return parseAIResponse(text);
  } catch (error) {
    if (['INVALID_AI_RESPONSE', 'AI_NOT_CONFIGURED', 'AI_QUOTA_EXCEEDED'].includes(error.code)) throw error;
    console.error('[aiService] generatePostContent:', error.message);
    throw Object.assign(new Error(`Failed to generate content: ${error.message}`), { code: 'AI_API_ERROR' });
  }
};

/**
 * Improve existing blog post HTML content.
 * Returns: string (improved HTML)
 */
const improvePostContent = async (currentContent, instructions) => {
  const system = 'You are a professional blog editor. Return ONLY raw JSON — no markdown, no code fences.';
  const user = `Improve the following blog post content based on these instructions: "${instructions}".

Current Content:
${currentContent}

Return a valid JSON object exactly like this:
{
  "content": "<p>Your improved HTML content here...</p>"
}`;

  try {
    const text = await callLLM(system, user);
    const parsed = parseAIResponse(text);
    return parsed.content;
  } catch (error) {
    if (['INVALID_AI_RESPONSE', 'AI_NOT_CONFIGURED', 'AI_QUOTA_EXCEEDED'].includes(error.code)) throw error;
    console.error('[aiService] improvePostContent:', error.message);
    throw Object.assign(new Error('Failed to improve content. The AI service may be temporarily unavailable.'), { code: 'AI_API_ERROR' });
  }
};

/**
 * Quick connectivity test — pings the LLM with a minimal prompt.
 * Returns: { ok: true, provider, model, durationMs, reply }
 */
const testConnection = async () => {
  if (!AI_API_KEY) {
    throw Object.assign(
      new Error('AI service is not configured. Please set AI_API_KEY in your environment.'),
      { code: 'AI_NOT_CONFIGURED' }
    );
  }

  const start = Date.now();
  const reply = await callLLM(
    'You are a connectivity test assistant. Reply with exactly one word.',
    'Reply with the single word "OK" and nothing else.'
  );

  return {
    ok: true,
    provider: AI_BASE_URL,
    model: AI_MODEL,
    durationMs: Date.now() - start,
    reply: reply.trim(),
  };
};

module.exports = { generatePostContent, improvePostContent, testConnection };
