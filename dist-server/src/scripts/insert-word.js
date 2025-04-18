import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: '.env.development' });
async function insertWord() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
    }
    const client = createClient(supabaseUrl, supabaseKey);
    try {
        const { data, error } = await client
            .from('words')
            .insert([
            {
                word: 'cogitate',
                definition: 'To reason, argue, or think carefully and thoroughly.',
                etymology: 'From Latin cogitare, to think, consider, or deliberate.',
                first_letter: 'c',
                in_a_sentence: 'She ______________ on the problem for hours before finding a solution.',
                number_of_letters: 8,
                equivalents: 'contemplate, ponder, deliberate',
                difficulty: 'Hard'
            }
        ])
            .select();
        if (error) {
            console.error('Error inserting word:', error);
            throw error;
        }
        console.log('Successfully inserted word:', data);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
insertWord().catch(console.error);
