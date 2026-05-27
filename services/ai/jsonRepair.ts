import { checkAiClient, AI_MODEL } from './aiClient';

export async function repairJson(invalidJsonStr: string, errorMessage: string): Promise<string> {
  const client = checkAiClient();

  const prompt = `You are a strict JSON repair bot.
I tried to parse the following JSON but it failed with the error: ${errorMessage}

Here is the invalid JSON string:
${invalidJsonStr}

Fix the JSON so it is completely valid and parseable.
Return ONLY the raw fixed JSON object. Do not include markdown blocks or any other text.`;

  const response = await client.chat.completions.create({
    model: AI_MODEL, // using a smaller/faster model for repair
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0,
  });

  const fixedJson = response.choices[0]?.message?.content?.trim() ?? '';
  
  // Remove markdown ticks if present just in case
  return fixedJson.replace(/^```(?:json)?|```$/g, '').trim();
}
