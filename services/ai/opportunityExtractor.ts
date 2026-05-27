import { z } from 'zod';
import { checkAiClient, AI_MODEL } from './aiClient';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionUserPrompt } from './extractionPrompt';
import { repairJson } from './jsonRepair';

// ─── Zod Schema ──────────────────────────────────────────────────────────────

export const OpportunityExtractedSchema = z.object({
  programName: z.string().nullable().optional().default(null),
  organization: z.string().nullable().optional().default(null),
  country: z.string().nullable().optional().default(null),
  region: z.string().nullable().optional().default(null),
  deadline: z.string().nullable().optional().default(null),
  eligibility: z.string().nullable().optional().default(null),
  fundingAmount: z.string().nullable().optional().default(null),
  category: z.string().nullable().optional().default(null),
  applicationLink: z.string().nullable().optional().default(null),
  description: z.string().nullable().optional().default(null),
  tags: z.array(z.string()).nullable().optional().default([]).catch([]),
  remoteType: z.enum(['remote', 'in-person', 'hybrid']).nullable().optional().default(null).catch(null),
  womenFounderFriendly: z.boolean().nullable().optional().default(false).catch(false),
  indianApplicantEligible: z.boolean().nullable().optional().default(false).catch(false),
  studentEligible: z.boolean().nullable().optional().default(false).catch(false),
  ageLimit: z.string().nullable().optional().default(null),
  applicationFee: z.string().nullable().optional().default(null),
});

export type OpportunityExtractedData = z.infer<typeof OpportunityExtractedSchema>;

export interface ExtractionResult {
  success: boolean;
  data: OpportunityExtractedData | null;
  error?: string;
}

// ─── Extractor function ───────────────────────────────────────────────────────

export async function extractOpportunityData(
  rawText: string,
  sourceUrl: string,
  title: string
): Promise<ExtractionResult> {
  const client = checkAiClient();

  const userPrompt = buildExtractionUserPrompt(rawText, title, sourceUrl);

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL, // using dynamic model
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // low temperature for structured extraction
    });

    let rawJsonStr = response.choices[0]?.message?.content?.trim() ?? '';
    
    // Clean up potential markdown formatting
    rawJsonStr = rawJsonStr.replace(/^```(?:json)?|```$/g, '').trim();

    return await processJsonStr(rawJsonStr, rawText);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown AI extraction error';
    return { success: false, data: null, error: message };
  }
}

async function processJsonStr(jsonStr: string, rawText: string): Promise<ExtractionResult> {
  try {
    const parsedObj = JSON.parse(jsonStr);
    
    // Apply fallback logic for deadline if missing
    applyFallbackLogic(parsedObj, rawText);

    // Validate against schema
    const validatedData = OpportunityExtractedSchema.parse(parsedObj);
    return { success: true, data: validatedData };
  } catch (parseErr: any) {
    console.warn(`[Extractor] JSON parse/validation failed. Attempting repair. Error: ${parseErr.message}`);
    try {
      const repairedJsonStr = await repairJson(jsonStr, parseErr.message);
      const repairedObj = JSON.parse(repairedJsonStr);
      
      applyFallbackLogic(repairedObj, rawText);

      const validatedData = OpportunityExtractedSchema.parse(repairedObj);
      return { success: true, data: validatedData };
    } catch (repairErr: any) {
      console.error(`[Extractor] JSON repair also failed: ${repairErr.message}`);
      return { success: false, data: null, error: `Invalid JSON or schema mismatch: ${repairErr.message}` };
    }
  }
}

// ─── Fallback Logic ───────────────────────────────────────────────────────────

function applyFallbackLogic(data: any, rawText: string) {
  if (!data.deadline) {
    const fallbackDate = extractDeadlineRegex(rawText);
    if (fallbackDate) {
      data.deadline = fallbackDate;
    }
  }
}

function extractDeadlineRegex(text: string): string | null {
  // Common patterns
  // Deadline: 30 June 2026
  // Apply by May 20, 2026
  // Last date: 15/07/2026 (DD/MM/YYYY)
  const patterns = [
    /(?:deadline|apply by|closes?|last date)[:\s]+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /(?:deadline|apply by|closes?|last date)[:\s]+([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i,
    /(?:deadline|apply by|closes?|last date)[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    /(?:deadline)[:\s]+(\d{4}-\d{2}-\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      let dateStr = match[1];
      // Basic UK/EU format fix DD/MM/YYYY -> MM/DD/YYYY for Date parser if needed, 
      // but native Date handles some or we can just try parsing.
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [d, m, y] = dateStr.split('/');
        dateStr = `${y}-${m}-${d}`;
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }
  return null;
}
