/* Mock Antigravity client – replaces external SDK */
class Antigravity {
  apiKey: string;
  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }
  async run({ prompt, responseFormat }: { prompt: string; responseFormat: string }) {
    // Simple mock logic
    // Return JSON array of actions if asked for suggestions
    if (responseFormat === 'json' && /suggest.*next actions/i.test(prompt)) {
      return { output: JSON.stringify(['Apply now', 'Research company', 'Contact recruiter']) };
    }
    // Answer question (plain text)
    if (responseFormat === 'text') {
      return { output: 'This is a mock answer based on available data.' };
    }
    // Default fallback
    return { output: responseFormat === 'json' ? '[]' : '' };
  }
}
import type { Opportunity } from '@/types';

// Initialize Antigravity client (key from env)
const antigravity = new Antigravity({ apiKey: process.env.NEXT_PUBLIC_ANTIGRAVITY_KEY! });

/**
 * Get suggested next actions for an opportunity.
 * Returns an array of short strings like "Apply now".
 */
export async function getNextActions(opportunityId: string): Promise<string[]> {
  const prompt = `For the opportunity with ID ${opportunityId}, suggest up to three concise next actions (e.g., "Apply now", "Research company", "Contact recruiter"). Only return a JSON array of strings.`;
  const response = await antigravity.run({ prompt, responseFormat: 'json' });
  try {
    const actions = JSON.parse(response.output);
    return Array.isArray(actions) ? actions : [];
  } catch {
    return [];
  }
}

/**
 * Auto‑classify an opportunity into a Kanban column.
 * Returns one of "Saved", "Medium", or "Planning".
 */
export async function classifyOpportunity(opportunity: Opportunity): Promise<'Saved' | 'Medium' | 'Planning'> {
  const prompt = `Given the following opportunity data, decide which Kanban column it belongs to. Return only one of the strings: "Saved", "Medium", or "Planning".\n\n${JSON.stringify(opportunity, null, 2)}`;
  const response = await antigravity.run({ prompt, responseFormat: 'json' });
  const result = response.output.trim().replace(/['\"]+/g, '');
  if (result === 'Saved' || result === 'Medium' || result === 'Planning') return result as any;
  return 'Saved';
}

/**
 * Answer a free‑form question about an opportunity.
 */
export async function answerOpportunityQuestion(opportunityId: string, query: string): Promise<string> {
  const prompt = `You are an assistant for a job‑opportunity tracker. Answer the user question using only the data that exists for opportunity ID ${opportunityId}.\n\nQuestion: ${query}\n\nProvide a concise answer.`;
  const response = await antigravity.run({ prompt, responseFormat: 'text' });
  return response.output.trim();
}
