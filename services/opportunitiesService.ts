import { supabase } from '@/lib/supabaseClient';
import type { Opportunity, OpportunityFilters, PaginatedResponse } from '@/types';

const TABLE = 'opportunities';

export async function getOpportunities(
  filters: OpportunityFilters = {}
): Promise<PaginatedResponse<Opportunity>> {
  const {
    search,
    category,
    country,
    region,
    remote_type,
    women_founder_friendly,
    indian_applicant_eligible,
    student_eligible,
    tag,
    tags,
    deadlineBefore,
    deadlineAfter,
    status = 'active',
    page = 1,
    pageSize = 12,
  } = filters;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    if (status === 'active') {
      // For dashboard, 'active' filter might mean show active + needs_review
      query = query.in('status', ['active', 'needs_review']);
    } else {
      query = query.eq('status', status);
    }
  }
  if (category) query = query.ilike('category', `%${category}%`);
  if (country) query = query.ilike('country', `%${country}%`);
  if (region) query = query.ilike('region', `%${region}%`);
  if (remote_type) query = query.eq('remote_type', remote_type.toLowerCase());
  if (women_founder_friendly) query = query.eq('women_founder_friendly', true);
  if (indian_applicant_eligible) query = query.eq('indian_applicant_eligible', true);
  if (student_eligible) query = query.eq('student_eligible', true);
  
  if (tag) query = query.contains('tags', [tag]);
  if (tags && tags.length > 0) query = query.contains('tags', tags);
  
  if (deadlineBefore) query = query.lte('deadline', deadlineBefore);
  if (deadlineAfter) query = query.gte('deadline', deadlineAfter);

  if (search) {
    // Strip commas and parentheses to avoid PostgREST .or() syntax confusion
    const cleanSearch = search.replace(/[,()]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanSearch) {
      query = query.or(
        `title.ilike.%${cleanSearch}%,organization.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%,eligibility.ilike.%${cleanSearch}%`
      );
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    data: (data as Opportunity[]) ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(error.message);
  }

  return data as Opportunity;
}

export async function createOpportunity(
  payload: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
): Promise<Opportunity> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Opportunity;
}

export async function upsertOpportunity(
  payload: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
): Promise<Opportunity> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert([payload], { onConflict: 'source_url' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Opportunity;
}
