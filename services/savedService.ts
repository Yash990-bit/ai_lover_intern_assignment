import { supabase } from '@/lib/supabaseClient';
import type { SavedOpportunity, ApplicationStatus, Priority } from '@/types';

const TABLE = 'saved_opportunities';

// For MVP, if user_id is null, it's just saved globally or anonymously.
export async function getSavedOpportunities(
  userId: string | null = null
): Promise<SavedOpportunity[]> {
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      opportunity:opportunities(*)
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data as SavedOpportunity[];
}

export async function saveOpportunity(
  opportunityId: string,
  userId: string | null = null
): Promise<SavedOpportunity> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        opportunity_id: opportunityId,
        user_id: userId,
        application_status: 'Saved',
        priority: 'Medium',
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error('Already saved');
    }
    throw new Error(error.message);
  }

  return data as SavedOpportunity;
}

export async function updateSavedOpportunity(
  id: string,
  updates: { application_status?: ApplicationStatus; priority?: Priority; notes?: string }
): Promise<SavedOpportunity> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SavedOpportunity;
}

export async function deleteSavedOpportunity(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getApplicationTimeline(savedOpportunityId: string) {
  const { data, error } = await supabase
    .from('application_timeline')
    .select('*')
    .eq('saved_opportunity_id', savedOpportunityId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
