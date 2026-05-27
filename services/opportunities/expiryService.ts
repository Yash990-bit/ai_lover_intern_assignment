import { supabase } from '@/lib/supabaseClient';

export async function markExpiredOpportunities() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('opportunities')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .in('status', ['active', 'upcoming'])
    .lt('deadline', today)
    .select('id');

  if (error) {
    console.error('Error marking expired opportunities:', error);
    throw new Error(error.message);
  }

  return { expiredCount: data ? data.length : 0 };
}
