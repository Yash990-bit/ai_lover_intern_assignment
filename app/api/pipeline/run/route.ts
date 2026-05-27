import { NextRequest, NextResponse } from 'next/server';
import { runDailyPipeline } from '@/scripts/dailyPipeline';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-pipeline-secret');
    const expectedSecret = process.env.PIPELINE_SECRET;

    if (!expectedSecret) {
      return NextResponse.json({ error: 'PIPELINE_SECRET is not configured' }, { status: 500 });
    }

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await runDailyPipeline();

    return NextResponse.json({ success: true, summary }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
