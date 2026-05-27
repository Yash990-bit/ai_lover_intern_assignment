/**
 * deduplicator.ts
 *
 * Before inserting any scraped opportunity into the database, we check:
 *   1. Exact source_url match       → definite duplicate
 *   2. Exact title match            → likely duplicate
 *   3. Title + source_name match    → same source re-posting same opportunity
 *
 * Returns a list of truly-new opportunities that should be inserted.
 */

import { supabase } from '@/lib/supabaseClient';
import type { RawOpportunity } from './scrapers/baseScraper';

export interface DeduplicationResult {
  toInsert: RawOpportunity[];
  skipped: { opportunity: RawOpportunity; reason: string }[];
}

/**
 * Filters out opportunities that already exist in the DB.
 * Batch-checks against the DB to minimise round-trips.
 */
export async function deduplicateOpportunities(
  candidates: RawOpportunity[]
): Promise<DeduplicationResult> {
  if (candidates.length === 0) {
    return { toInsert: [], skipped: [] };
  }

  const toInsert: RawOpportunity[] = [];
  const skipped: { opportunity: RawOpportunity; reason: string }[] = [];

  // ── Check 1: source_url exact match ─────────────────────────────────────────
  const urls = candidates.map((c) => c.sourceUrl).filter(Boolean);

  const { data: urlMatches } = await supabase
    .from('opportunities')
    .select('source_url')
    .in('source_url', urls);

  const existingUrls = new Set((urlMatches ?? []).map((r) => r.source_url));

  // ── Check 2: title exact match ───────────────────────────────────────────────
  const titles = candidates.map((c) => c.title).filter(Boolean);

  const { data: titleMatches } = await supabase
    .from('opportunities')
    .select('title, source_url')
    .in('title', titles);

  const existingTitles = new Set((titleMatches ?? []).map((r) => r.title?.toLowerCase()));

  // ── In-batch dedup (avoid inserting dupes within the same run) ───────────────
  const seenInBatch = new Map<string, true>(); // key: url | "title:source"

  for (const opp of candidates) {
    // Check 1 — URL
    if (existingUrls.has(opp.sourceUrl)) {
      skipped.push({ opportunity: opp, reason: 'duplicate_url' });
      continue;
    }

    // Check 2 — Title
    if (existingTitles.has(opp.title.toLowerCase())) {
      skipped.push({ opportunity: opp, reason: 'duplicate_title' });
      continue;
    }

    // Check 3 — Title + source_name within this batch
    const batchKey = `${opp.title.toLowerCase()}::${opp.sourceName.toLowerCase()}`;
    if (seenInBatch.has(batchKey)) {
      skipped.push({ opportunity: opp, reason: 'duplicate_in_batch' });
      continue;
    }

    seenInBatch.set(batchKey, true);
    toInsert.push(opp);
  }

  return { toInsert, skipped };
}
