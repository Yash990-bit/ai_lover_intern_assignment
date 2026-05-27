/**
 * scripts/runScrapers.ts
 *
 * CLI entry-point for the scraper pipeline.
 *
 * Usage:
 *   npm run scrape
 *   # or directly:
 *   npx tsx scripts/runScrapers.ts
 *   # with verbose output:
 *   DEBUG=1 npx tsx scripts/runScrapers.ts
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

if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
  console.error('\n❌ NEXT_PUBLIC_SUPABASE_URL is not set or invalid in .env.local\n');
  process.exit(1);
}
if (!SUPABASE_KEY || SUPABASE_KEY === 'your-anon-key-here') {
  console.error('\n❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local\n');
  process.exit(1);
}

// ── Import after env is loaded ────────────────────────────────────────────────
import { runAllScrapers } from '../services/scrapers/scraperRunner.js';
import type { RunnerReport } from '../services/scrapers/scraperRunner.js';

// ── Run ───────────────────────────────────────────────────────────────────────
console.log('═'.repeat(60));
console.log('  🌍 OpportunityTracker — Scraper Pipeline');
console.log(`  Started: ${new Date().toLocaleString()}`);
console.log('═'.repeat(60));

let report: RunnerReport;

try {
  report = await runAllScrapers();
} catch (err) {
  console.error('\n💥 Fatal error in scraper pipeline:\n', err);
  process.exit(1);
}

// ── Print summary ─────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log('  📋 Final Summary');
console.log('═'.repeat(60));
console.log(`  Scrapers run:    ${report.scrapers.length}`);
console.log(`  Total scraped:   ${report.totalScraped}`);
console.log(`  New (inserted):  ${report.totalInserted}`);
console.log(`  Skipped (dupes): ${report.totalSkipped}`);
console.log(`  Duration:        ${(report.durationMs / 1000).toFixed(1)}s`);
console.log('═'.repeat(60) + '\n');

// Per-scraper status
for (const s of report.scrapers) {
  const icon = s.status === 'success' ? '✅' : s.status === 'partial' ? '⚠️' : '❌';
  console.log(`  ${icon} ${s.name.padEnd(25)} found=${s.found}  inserted=${s.inserted}  skipped=${s.skipped}`);
  if (s.error) console.log(`       Error: ${s.error}`);
}
console.log();

process.exit(0);
