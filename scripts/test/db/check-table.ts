import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

async function checkTable() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const client = createClient(supabaseUrl, supabaseKey);

  try {
    // Try to select all columns from the words table
    const { data, error } = await client
      .from('words')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying table:', error);
      throw error;
    }

    console.log('Table structure:', data);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTable().catch(console.error); 