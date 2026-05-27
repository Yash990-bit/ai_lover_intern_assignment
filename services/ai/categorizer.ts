const STANDARD_CATEGORIES = [
  'Scholarship',
  'Fellowship',
  'Startup Accelerator',
  'Grant',
  'Competition',
  'Conference',
  'Exchange Program',
  'Government Scheme',
  'Giveaway',
  'Internship',
  'Research Program',
  'Other'
];

const STANDARD_TAGS = [
  'AI', 'Startup', 'Women', 'Research', 'Design', 'MBA', 
  'Engineering', 'Climate', 'Travel', 'Social Impact', 
  'Hackathon', 'Student', 'Founder', 'Grant'
];

/**
 * Normalizes the category returned by the LLM to match our standard list.
 */
export function normalizeCategory(category: string | null): string {
  if (!category) return 'Other';
  
  const lowerCat = category.toLowerCase().trim();
  
  // Try to find exact or partial match
  for (const std of STANDARD_CATEGORIES) {
    if (lowerCat === std.toLowerCase() || lowerCat.includes(std.toLowerCase())) {
      // Map 'startup accelerator' back to 'accelerator' for db consistency if needed, 
      // but UI uses standard list. Let's return the standard one.
      return std.toLowerCase().replace(' ', '_'); // e.g. "startup accelerator" -> "startup_accelerator"
    }
  }

  // Common fallbacks
  if (lowerCat.includes('accelerator') || lowerCat.includes('incubator')) return 'accelerator';
  if (lowerCat.includes('scholarship')) return 'scholarship';
  if (lowerCat.includes('fellowship')) return 'fellowship';
  if (lowerCat.includes('grant') || lowerCat.includes('funding')) return 'grant';
  if (lowerCat.includes('competition') || lowerCat.includes('hackathon') || lowerCat.includes('challenge')) return 'competition';
  if (lowerCat.includes('conference') || lowerCat.includes('event')) return 'conference';
  if (lowerCat.includes('exchange') || lowerCat.includes('study abroad')) return 'exchange_program';
  if (lowerCat.includes('internship')) return 'internship';
  if (lowerCat.includes('government')) return 'government_scheme';
  
  return 'other';
}

/**
 * Normalizes tags returned by LLM, attempting to map them to our standard tags 
 * and ensuring they look nice.
 */
export function normalizeTags(tags: string[] | null | undefined): string[] {
  const normalized = new Set<string>();

  if (!tags || !Array.isArray(tags)) return [];

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase().trim();
    if (!lowerTag) continue;

    let matched = false;
    for (const std of STANDARD_TAGS) {
      if (lowerTag === std.toLowerCase() || lowerTag.includes(std.toLowerCase())) {
        normalized.add(std.toLowerCase());
        matched = true;
        break;
      }
    }
    
    if (!matched && lowerTag.length < 20) { // Keep short non-standard tags
      normalized.add(lowerTag);
    }
  }

  return Array.from(normalized);
}
