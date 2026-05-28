import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  console.log('Dotenv loaded. Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { supabase } = await import('../lib/supabaseClient');
  
  try {
    const { data, count, error } = await supabase
      .from('opportunities')
      .select('id, title, status', { count: 'exact' });
      
    if (error) {
      console.error('Supabase query error:', error.message);
    } else {
      console.log('Database query success! Total rows:', count);
      console.log('Sample rows:', data?.slice(0, 5));
    }
  } catch (err: any) {
    console.error('Critical database query failure:', err.message);
  }
}

run();
