import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { runAllScrapers } from '../services/scrapers/scraperRunner';
import { processAllRawOpportunities } from '../services/ai/processRaw';
import { markExpiredOpportunities } from '../services/opportunities/expiryService';

export async function runDailyPipeline() {
  console.log('🚀 Starting Daily Opportunity Pipeline...\n');

  try {
    // Step 1 & 2: Run Scrapers and Save Raw
    console.log('🔄 Step 1: Running Scrapers...');
    const scrapeResults = await runAllScrapers();
    const totalFound = scrapeResults.totalScraped;
    const totalNewRaw = scrapeResults.totalInserted;
    const sourcesChecked = scrapeResults.scrapers.length;
    console.log(`✅ Scrapers finished. Sources checked: ${sourcesChecked}. Raw inserted: ${totalNewRaw}.`);

    // Step 3: Process Raw with AI
    console.log('\n🧠 Step 2: Processing Raw Opportunities with AI...');
    const aiResults = await processAllRawOpportunities();
    console.log(`✅ AI Processing finished. Processed: ${aiResults.processed}, Success: ${aiResults.success}, Failed/Needs Review: ${aiResults.failed}.`);

    // Step 4: Mark Expired
    console.log('\n⏳ Step 3: Marking Expired Opportunities...');
    const expiryResults = await markExpiredOpportunities();
    console.log(`✅ Expiry check finished. Expired count: ${expiryResults.expiredCount}.`);

    // Step 5: Summary
    console.log('\n📊 PIPELINE SUMMARY:');
    console.log('--------------------------------------------------');
    console.log(`Sources Checked         : ${sourcesChecked}`);
    console.log(`Raw Found               : ${totalFound}`);
    console.log(`New Raw Inserted        : ${totalNewRaw}`);
    console.log(`AI Processed Count      : ${aiResults.processed}`);
    console.log(`AI Extraction Success   : ${aiResults.success}`);
    console.log(`AI Extraction Failed    : ${aiResults.failed}`);
    console.log(`Marked as Expired       : ${expiryResults.expiredCount}`);
    console.log('--------------------------------------------------');
    console.log('✨ Pipeline execution complete!');

    return {
      sourcesChecked,
      rawFound: totalFound,
      newRawInserted: totalNewRaw,
      aiProcessed: aiResults.processed,
      aiSuccess: aiResults.success,
      aiFailed: aiResults.failed,
      expiredCount: expiryResults.expiredCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Pipeline failed critically:', error);
    throw error;
  }
}

// Allow direct execution via CLI
if (require.main === module) {
  runDailyPipeline().then(() => process.exit(0)).catch(() => process.exit(1));
}
