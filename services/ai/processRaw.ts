import { supabase } from '@/lib/supabaseClient';
import { extractOpportunityData } from './opportunityExtractor';
import { normalizeCategory, normalizeTags } from './categorizer';

export async function processAllRawOpportunities() {
  const { data: rawOpps, error } = await supabase
    .from('opportunities')
    .select('id, raw_text, source_url, title')
    .in('status', ['raw', 'needs_review']);

  if (error) {
    throw new Error(`Failed to fetch raw opportunities: ${error.message}`);
  }

  if (!rawOpps || rawOpps.length === 0) {
    return { processed: 0, success: 0, failed: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  for (const opp of rawOpps) {
    if (!opp.raw_text) {
      failedCount++;
      continue;
    }

    console.log(`Processing: ${opp.title}`);
    const result = await extractOpportunityData(opp.raw_text, opp.source_url || '', opp.title);

    if (result.success && result.data) {
      const extracted = result.data;
      
      await supabase
        .from('opportunities')
        .update({
          title: extracted.programName || opp.title,
          organization: extracted.organization,
          country: extracted.country,
          region: extracted.region,
          deadline: extracted.deadline,
          eligibility: extracted.eligibility,
          funding_amount: extracted.fundingAmount,
          category: normalizeCategory(extracted.category),
          application_link: extracted.applicationLink,
          description: extracted.description,
          tags: normalizeTags(extracted.tags),
          remote_type: extracted.remoteType,
          women_founder_friendly: extracted.womenFounderFriendly,
          indian_applicant_eligible: extracted.indianApplicantEligible,
          student_eligible: extracted.studentEligible,
          age_limit: extracted.ageLimit,
          application_fee: extracted.applicationFee,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', opp.id);
      
      successCount++;
    } else {
      // Check if it's a rate limit error — stop early so caller can use fallback
      const isRateLimit = result.error?.includes('429') || result.error?.includes('Rate limit');
      if (isRateLimit) {
        console.warn(`Rate limit hit — stopping AI processing early after ${successCount} successes.`);
        failedCount++;
        break; // exit the loop, let the route handler trigger fallback
      }

      console.warn(`Failed to process ${opp.title}: ${result.error}`);
      await supabase
        .from('opportunities')
        .update({ status: 'needs_review', updated_at: new Date().toISOString() })
        .eq('id', opp.id);
      
      failedCount++;
    }

    // Delay 3.5 seconds to avoid Groq/OpenAI free tier rate limits (Tokens Per Minute)
    await new Promise((resolve) => setTimeout(resolve, 3500));
  }

  return { processed: rawOpps.length, success: successCount, failed: failedCount };
}
