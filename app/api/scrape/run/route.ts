import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/services/scrapers/scraperRunner';
import { processAllRawOpportunities } from '@/services/ai/processRaw';
import { supabase } from '@/lib/supabaseClient';

/**
 * Fallback: if Groq AI is rate-limited, promote raw items to active
 * using their already-scraped fields (title, category, description).
 * No AI call needed — good enough to show on the dashboard.
 */
async function activateRawItemsDirectly(): Promise<{ activated: number }> {
  const { data: rawItems, error } = await supabase
    .from('opportunities')
    .select('id, title, category')
    .in('status', ['raw', 'needs_review'])
    .limit(50);

  if (error || !rawItems || rawItems.length === 0) return { activated: 0 };

  const ids = rawItems.map((r) => r.id);

  const { error: updateError } = await supabase
    .from('opportunities')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (updateError) {
    console.error('Failed to activate raw items:', updateError.message);
    return { activated: 0 };
  }

  console.log(`✅ Activated ${ids.length} items directly (no AI, fallback mode)`);
  return { activated: ids.length };
}

export async function POST() {
  try {
    // Step 1: Scrape all sources
    const report = await runAllScrapers();

    // Step 2: Try AI processing; if it fails due to rate limits, fall back
    let aiSummary = { processed: 0, success: 0, failed: 0 };
    let fallbackActivated = 0;

    try {
      aiSummary = await processAllRawOpportunities();

      // If AI failed to process everything (rate limit), activate the rest directly
      if (aiSummary.failed > 0 || aiSummary.processed === 0) {
        const fallback = await activateRawItemsDirectly();
        fallbackActivated = fallback.activated;
      }
    } catch (aiErr) {
      console.warn('AI processing threw an error, falling back to direct activation:', aiErr);
      const fallback = await activateRawItemsDirectly();
      fallbackActivated = fallback.activated;
    }

    const totalNewOnDashboard = aiSummary.success + fallbackActivated;

    return NextResponse.json({
      success: true,
      scraped: report.totalScraped,
      inserted: report.totalInserted,
      skipped: report.totalSkipped,
      aiSuccess: aiSummary.success,
      aiFailed: aiSummary.failed,
      fallbackActivated,
      totalNewOnDashboard,
      sources: report.scrapers.map((s) => ({
        name: s.name,
        status: s.status,
        found: s.found,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
