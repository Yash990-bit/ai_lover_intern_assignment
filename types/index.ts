// ─── Core Opportunity Type ────────────────────────────────────────────────────

export type OpportunityCategory =
  | 'scholarship'
  | 'fellowship'
  | 'accelerator'
  | 'grant'
  | 'competition'
  | 'conference'
  | 'exchange_program'
  | 'government_scheme'
  | 'giveaway'
  | 'other';

export type RemoteType = 'remote' | 'in-person' | 'hybrid';

export type OpportunityStatus = 'active' | 'expired' | 'upcoming' | 'closed';

export interface Opportunity {
  id: string;
  title: string;
  organization: string | null;
  country: string | null;
  region: string | null;
  category: OpportunityCategory | string;
  description: string | null;
  eligibility: string | null;
  funding_amount: string | null;
  deadline: string | null; // ISO date string
  application_link: string | null;
  source_url: string | null;
  tags: string[];
  remote_type: RemoteType | string | null;
  women_founder_friendly: boolean;
  indian_applicant_eligible: boolean;
  student_eligible: boolean;
  age_limit: string | null;
  application_fee: string | null;
  status: OpportunityStatus | string;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Saved Opportunity ────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'Saved'
  | 'Planning to Apply'
  | 'Applied'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Waitlisted';

export type Priority = 'Low' | 'Medium' | 'High';

export interface SavedOpportunity {
  id: string;
  user_id: string | null;
  opportunity_id: string;
  application_status: ApplicationStatus;
  priority: Priority;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation
  opportunity?: Opportunity;
}

// ─── Application Timeline ─────────────────────────────────────────────────────

export interface ApplicationTimeline {
  id: string;
  saved_opportunity_id: string;
  status: ApplicationStatus;
  note: string | null;
  created_at: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
}

// ─── Source Log ───────────────────────────────────────────────────────────────

export type SourceLogStatus = 'success' | 'failed' | 'partial' | 'running';

export interface SourceLog {
  id: string;
  source_name: string;
  source_url: string;
  status: SourceLogStatus | string;
  opportunities_found: number;
  error_message: string | null;
  created_at: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export interface OpportunityFilters {
  search?: string;
  category?: string;
  country?: string;
  region?: string;
  remote_type?: string;
  women_founder_friendly?: boolean;
  indian_applicant_eligible?: boolean;
  student_eligible?: boolean;
  status?: string;
  tags?: string[];
  tag?: string;
  deadlineBefore?: string;
  deadlineAfter?: string;
  ai_mode?: boolean;
  page?: number;
  pageSize?: number;
}
