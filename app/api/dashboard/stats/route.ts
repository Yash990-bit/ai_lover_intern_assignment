import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // 1. Total active
    const { count: activeCount } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'needs_review']);

    // 2. Saved count
    const { count: savedCount } = await supabase
      .from('saved_opportunities')
      .select('*', { count: 'exact', head: true });

    // 3. Deadlines this week (active only)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { count: deadlinesWeek } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('deadline', today.toISOString().split('T')[0])
      .lte('deadline', nextWeek.toISOString().split('T')[0]);

    return NextResponse.json({
      activeOpportunities: activeCount ?? 0,
      savedOpportunities: savedCount ?? 0,
      deadlinesThisWeek: deadlinesWeek ?? 0,
    }, { status: 200 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
