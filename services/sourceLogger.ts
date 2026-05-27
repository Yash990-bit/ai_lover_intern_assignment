/**
 * sourceLogger.ts
 *
 * Writes scraper run results into the source_logs table.
 */

import { supabase } from '@/lib/supabaseClient';
import type { ScraperResult } from './scrapers/baseScraper';

export async function logScraperRun(result: ScraperResult): Promise<void> {
  const { error } = await supabase.from('source_logs').insert([
    {
      source_name: result.sourceName,
      source_url: result.sourceUrl,
      status: result.status,
      opportunities_found: result.opportunitiesFound,
      error_message: result.errorMessage ?? null,
    },
  ]);

  if (error) {
    console.error(`[sourceLogger] Failed to write log for ${result.sourceName}: ${error.message}`);
  }
}

export async function logScraperRuns(results: ScraperResult[]): Promise<void> {
  await Promise.allSettled(results.map(logScraperRun));
}
