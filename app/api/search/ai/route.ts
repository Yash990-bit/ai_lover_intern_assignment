import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalSearchQuery } from '@/services/ai/naturalSearch';
import { getOpportunities } from '@/services/opportunitiesService';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    // Attempt AI parsing
    const filters = await parseNaturalSearchQuery(query);

    // If AI fails or returns empty, fallback to basic search
    const finalFilters = filters && Object.keys(filters).length > 0
      ? filters
      : { search: query };

    // Fetch using standard opportunities service
    const results = await getOpportunities(finalFilters);

    return NextResponse.json({
      filters: finalFilters,
      results
    }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
