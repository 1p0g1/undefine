import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: '.env.development' });
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
        }
        console.log('Credentials loaded:', { supabaseUrl });
        const client = createClient(supabaseUrl, supabaseKey);
        // Test getting all words
        const { data, error } = await client
            .from('words')
            .select('*')
            .limit(5);
        if (error) {
            console.error('Error fetching words:', error);
            return;
        }
        console.log('\nFirst 5 words in database:');
        console.log(JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error('Error testing connection:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
    }
}
testSupabaseConnection().catch(console.error);
