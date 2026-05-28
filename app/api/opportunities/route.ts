import { NextRequest, NextResponse } from 'next/server';
import { getOpportunities, createOpportunity } from '@/services/opportunitiesService';
import type { OpportunityFilters } from '@/types';

// GET /api/opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: OpportunityFilters = {
      search: searchParams.get('search') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      country: searchParams.get('country') ?? undefined,
      region: searchParams.get('region') ?? undefined,
      remote_type: searchParams.get('remote_type') ?? undefined,
      status: searchParams.get('status') ?? 'active',
      tag: searchParams.get('tag') ?? undefined,
      deadlineBefore: searchParams.get('deadlineBefore') ?? undefined,
      deadlineAfter: searchParams.get('deadlineAfter') ?? undefined,
      women_founder_friendly: searchParams.get('women_founder_friendly') === 'true' || undefined,
      indian_applicant_eligible:
        searchParams.get('indian_applicant_eligible') === 'true' || undefined,
      student_eligible: searchParams.get('student_eligible') === 'true' || undefined,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 12),
    };

    const result = await getOpportunities(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Opportunities GET error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/opportunities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const opportunity = await createOpportunity(body);
    return NextResponse.json(opportunity, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
