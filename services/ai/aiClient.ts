import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

export const aiClient = groqKey
  ? new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' })
  : openaiKey
  ? new OpenAI({ apiKey: openaiKey })
  : null;

export const AI_MODEL = groqKey ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

export function checkAiClient() {
  if (!aiClient) {
    throw new Error('Neither GROQ_API_KEY nor OPENAI_API_KEY is configured.');
  }
  return aiClient;
}
