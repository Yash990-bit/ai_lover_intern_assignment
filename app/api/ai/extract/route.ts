import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { extractOpportunityData } from '@/services/ai/opportunityExtractor';
import { normalizeCategory, normalizeTags } from '@/services/ai/categorizer';

export async function POST(request: NextRequest) {
  try {
    const { opportunityId } = await request.json();

    if (!opportunityId) {
      return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 });
    }

    // 1. Fetch raw opportunity
    const { data: opp, error: fetchError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (fetchError || !opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (!opp.raw_text) {
      return NextResponse.json({ error: 'Opportunity has no raw_text to extract from' }, { status: 400 });
    }

    // 2. Run AI extraction
    const result = await extractOpportunityData(opp.raw_text, opp.source_url || '', opp.title);

    // 3. Update the opportunity row
    if (result.success && result.data) {
      const extracted = result.data;
      
      const { error: updateError } = await supabase
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
          status: 'active', // Extraction successful
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId);

      if (updateError) {
        throw new Error(`Failed to update DB: ${updateError.message}`);
      }

      return NextResponse.json({ success: true, message: 'Extracted and updated successfully' }, { status: 200 });
    } else {
      // Extraction failed, mark as needs_review
      await supabase
        .from('opportunities')
        .update({ status: 'needs_review', updated_at: new Date().toISOString() })
        .eq('id', opportunityId);

      // Log failure (could be to source_logs, but returning error for now)
      return NextResponse.json({ success: false, error: result.error, message: 'Marked as needs_review' }, { status: 422 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
