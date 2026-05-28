import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  console.log('Testing AI Search endpoint logic...');
  
  const { parseNaturalSearchQuery } = await import('../services/ai/naturalSearch');
  const { getOpportunities } = await import('../services/opportunitiesService');
  
  const sampleQuery = 'remote, grants (women) in Europe';
  console.log(`Input query: "${sampleQuery}"`);
  
  try {
    const filters = await parseNaturalSearchQuery(sampleQuery);
    console.log('AI parsed filters:', filters);
    
    const finalFilters = filters && Object.keys(filters).length > 0
      ? filters
      : { search: sampleQuery };
      
    console.log('Executing getOpportunities with filters:', finalFilters);
    const results = await getOpportunities(finalFilters);
    console.log('Opportunities successfully fetched! Count:', results.data.length);
  } catch (err: any) {
    console.error('CRITICAL SEARCH FAILURE:', err.message);
  }
}

run();
