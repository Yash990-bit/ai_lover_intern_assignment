import { z } from 'zod';
import { checkAiClient, AI_MODEL } from './aiClient';
import type { OpportunityFilters } from '@/types';

const NaturalSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  remote_type: z.enum(['remote', 'in-person', 'hybrid']).optional(),
  women_founder_friendly: z.boolean().optional(),
  indian_applicant_eligible: z.boolean().optional(),
  student_eligible: z.boolean().optional(),
  tag: z.string().optional(),
});

export async function parseNaturalSearchQuery(
  query: string
): Promise<OpportunityFilters | null> {
  const client = checkAiClient();

  const prompt = `You are a query parser for the ScrapeScout AI platform.
Convert the following natural language query into a JSON object representing search filters.

Valid fields:
- search (string): general keyword search if nothing else fits (e.g. "ai ml", "startup")
- category (string): MUST be singular (e.g. "scholarship", "grant", "fellowship", "accelerator", "competition")
- country (string): e.g. "Germany", "USA", "India"
- region (string): e.g. "Europe", "Asia", "Africa", "Global"
- remote_type: "remote", "in-person", or "hybrid"
- women_founder_friendly (boolean): true if looking for women/female opportunities
- indian_applicant_eligible (boolean): true if looking for India-eligible
- student_eligible (boolean): true if looking for student opportunities
- tag (string): a specific tag like "AI", "Startup", "Tech"

Rules:
1. Return strictly valid JSON matching the schema.
2. Only include fields that are explicitly or implicitly requested.
3. If they mention plural categories like "grants", convert to singular "grant".
4. If they search for technical topics like "AI ML", put that in the "search" or "tag" field.
5. No markdown blocks, just raw JSON.

Query: "${query}"`;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    let rawJsonStr = response.choices[0]?.message?.content?.trim() ?? '{}';
    rawJsonStr = rawJsonStr.replace(/^```(?:json)?|```$/g, '').trim();

    const parsed = JSON.parse(rawJsonStr);
    const validated = NaturalSearchSchema.parse(parsed);

    return validated as OpportunityFilters;
  } catch (err) {
    console.error('Failed to parse natural search query:', err);
    return null;
  }
}
