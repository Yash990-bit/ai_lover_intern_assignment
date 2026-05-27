/**
 * scripts/processRawOpportunities.ts
 *
 * CLI entry-point to process all raw opportunities using the AI pipeline.
 *
 * Usage:
 *   npm run process-raw
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local before anything else ──────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Validate required env vars immediately
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const GROQ_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
  console.error('\n❌ NEXT_PUBLIC_SUPABASE_URL is not set or invalid in .env.local\n');
  process.exit(1);
}
if (!SUPABASE_KEY || SUPABASE_KEY === 'your-anon-key-here') {
  console.error('\n❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local\n');
  process.exit(1);
}
if (!OPENAI_KEY && !GROQ_KEY) {
  console.error('\n❌ Neither OPENAI_API_KEY nor GROQ_API_KEY is set in .env.local\n');
  process.exit(1);
}

// ── Import after env is loaded ────────────────────────────────────────────────
import { processAllRawOpportunities } from '../services/ai/processRaw.js';

// ── Run ───────────────────────────────────────────────────────────────────────
console.log('═'.repeat(60));
console.log('  🧠 OpportunityTracker — AI Extraction Pipeline');
console.log(`  Started: ${new Date().toLocaleString()}`);
console.log('═'.repeat(60));

async function main() {
  try {
    const summary = await processAllRawOpportunities();
    
    console.log('\n' + '═'.repeat(60));
    console.log('  📋 Final Summary');
    console.log('═'.repeat(60));
    console.log(`  Total Processed: ${summary.processed}`);
    console.log(`  Success:         ${summary.success}`);
    console.log(`  Failed:          ${summary.failed}`);
    console.log('═'.repeat(60) + '\n');
    
  } catch (err) {
    console.error('\n💥 Fatal error in AI extraction pipeline:\n', err);
    process.exit(1);
  }

  process.exit(0);
}

main();
