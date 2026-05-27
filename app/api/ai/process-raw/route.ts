import { NextResponse } from 'next/server';
import { processAllRawOpportunities } from '@/services/ai/processRaw';

export async function POST() {
  try {
    const summary = await processAllRawOpportunities();
    return NextResponse.json(summary, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
