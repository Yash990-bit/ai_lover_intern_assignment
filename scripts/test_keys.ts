import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  console.log('Dotenv loaded. GROQ:', !!process.env.GROQ_API_KEY);
  
  const { checkAiClient, AI_MODEL } = await import('../services/ai/aiClient');
  
  try {
    const client = checkAiClient();
    console.log('Dynamic AI Client initialized. Model:', AI_MODEL);
    
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: 'Say hello!' }],
      max_tokens: 5,
    });
    
    console.log('API RESPONSE SUCCESS:', response.choices[0]?.message?.content);
  } catch (err: any) {
    console.error('API CALL FAILED:', err.message);
  }
}

run();
