/**
 * scraperRunner.ts
 *
 * Orchestrates all scrapers:
 *   1. Run every registered scraper (errors in one never stop others)
 *   2. Deduplicate across all results
 *   3. Bulk-insert new records into the DB
 *   4. Write a source_log entry for each scraper
 *   5. Return a summary report
 */

import { createClient } from '@supabase/supabase-js';
import { deduplicateOpportunities } from '../deduplicator';
import { logScraperRuns } from '../sourceLogger';
import { OpportunityDeskScraper } from './opportunityDeskScraper';
import { YouthOpportunitiesScraper } from './youthOpportunitiesScraper';
import { RssScraper } from './rssScraper';
import { DevpostScraper } from './devpostScraper';
import { IdealistScraper } from './idealistScraper';
import { ScholarshipsAdsScraper } from './scholarshipsAdsScraper';
import { runSafely, type IScraper, type RawOpportunity, type ScraperResult } from './baseScraper';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RunnerReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalScraped: number;
  totalInserted: number;
  totalSkipped: number;
  scrapers: Array<{
    name: string;
    status: string;
    found: number;
    inserted: number;
    skipped: number;
    error?: string;
    durationMs: number;
  }>;
}

// ─── DB insert helper ─────────────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key);
}

async function bulkInsertOpportunities(
  opps: RawOpportunity[]
): Promise<{ inserted: number; errors: string[] }> {
  if (opps.length === 0) return { inserted: 0, errors: [] };

  const supabase = getSupabase();
  const errors: string[] = [];

  const rows = opps.map((o) => ({
    title: o.title,
    organization: o.organization ?? null,
    country: o.country ?? null,
    region: null,
    category: o.category ?? 'other',
    description: o.description ?? null,
    eligibility: null,
    funding_amount: o.fundingAmount ?? null,
    deadline: o.deadline ?? null,
    application_link: o.applicationLink ?? o.sourceUrl,
    source_url: o.sourceUrl,
    tags: o.tags ?? [],
    remote_type: null,
    women_founder_friendly: false,
    indian_applicant_eligible: false,
    student_eligible: false,
    age_limit: null,
    application_fee: null,
    status: 'raw',           // mark as raw — awaiting AI extraction
    raw_text: o.rawText,
  }));

  // Insert in small batches to avoid payload limits
  const BATCH = 20;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from('opportunities')
      .insert(batch)
      .select('id');

    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
    } else {
      inserted += data?.length ?? 0;
    }
  }

  return { inserted, errors };
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export async function runAllScrapers(): Promise<RunnerReport> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  // Register all scrapers here — add new ones in one line
  const scrapers: IScraper[] = [
    new OpportunityDeskScraper(),
    new YouthOpportunitiesScraper(),
    new DevpostScraper(),
    new IdealistScraper(),
    new ScholarshipsAdsScraper(),
    new RssScraper(),
  ];

  console.log(`\n🚀 Starting scraper pipeline — ${scrapers.length} scrapers\n`);

  // ── Step 1: Run all scrapers in parallel (isolated failures) ──────────────
  const scraperResults: ScraperResult[] = await Promise.all(
    scrapers.map((s) => {
      console.log(`  ▶ Starting: ${s.name}`);
      return runSafely(s);
    })
  );

  // ── Step 2: Collect all raw opportunities ─────────────────────────────────
  const allOpportunities: RawOpportunity[] = scraperResults.flatMap((r) => r.opportunities);
  console.log(`\n📦 Total raw opportunities collected: ${allOpportunities.length}`);

  // ── Step 3: Deduplicate ───────────────────────────────────────────────────
  const { toInsert, skipped } = await deduplicateOpportunities(allOpportunities);
  console.log(`🔍 After dedup: ${toInsert.length} new, ${skipped.length} skipped`);

  // ── Step 4: Insert into DB ────────────────────────────────────────────────
  const { inserted, errors: insertErrors } = await bulkInsertOpportunities(toInsert);
  console.log(`✅ Inserted: ${inserted}`);
  if (insertErrors.length > 0) {
    console.warn('⚠ Insert errors:', insertErrors);
  }

  // ── Step 5: Log each scraper run ─────────────────────────────────────────
  await logScraperRuns(scraperResults);

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startMs;

  // ── Step 6: Build per-scraper stats for report ────────────────────────────
  const skippedBySource = new Map<string, number>();
  for (const { opportunity } of skipped) {
    const key = opportunity.sourceName;
    skippedBySource.set(key, (skippedBySource.get(key) ?? 0) + 1);
  }

  const insertedBySource = new Map<string, number>();
  for (const opp of toInsert) {
    insertedBySource.set(opp.sourceName, (insertedBySource.get(opp.sourceName) ?? 0) + 1);
  }

  const report: RunnerReport = {
    startedAt,
    finishedAt,
    durationMs,
    totalScraped: allOpportunities.length,
    totalInserted: inserted,
    totalSkipped: skipped.length,
    scrapers: scraperResults.map((r) => ({
      name: r.sourceName,
      status: r.status,
      found: r.opportunitiesFound,
      inserted: insertedBySource.get(r.sourceName) ?? 0,
      skipped: skippedBySource.get(r.sourceName) ?? 0,
      error: r.errorMessage,
      durationMs: r.durationMs,
    })),
  };

  console.log('\n📊 Scraper Pipeline Report:');
  console.table(
    report.scrapers.map((s) => ({
      Scraper: s.name,
      Status: s.status,
      Found: s.found,
      Inserted: s.inserted,
      Skipped: s.skipped,
      'Time (s)': (s.durationMs / 1000).toFixed(1),
      Error: s.error ?? '—',
    }))
  );
  console.log(`\n⏱  Total duration: ${(durationMs / 1000).toFixed(1)}s\n`);

  return report;
}
