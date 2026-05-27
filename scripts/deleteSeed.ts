import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log('🗑️ Deleting seed records...');
  const { data, error } = await supabase
    .from('opportunities')
    .delete()
    .ilike('source_url', '%seed-%')
    .select();
    
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Deleted ${data?.length} dummy records!`);
  }
}
main();
