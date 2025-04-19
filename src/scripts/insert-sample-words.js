import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: '.env.development' });
const sampleWords = [
    {
        word: 'cogitate',
        definition: 'To reason, argue, or think carefully and thoroughly.',
        etymology: 'From Latin cogitare, to think, consider, or deliberate.',
        first_letter: 'c',
        in_a_sentence: 'She cogitated on the problem for hours before finding a solution.',
        number_of_letters: 8,
        equivalents: 'contemplate, ponder, deliberate',
        date: new Date().toISOString().split('T')[0] // Today's date
    },
    {
        word: 'ephemeral',
        definition: 'Lasting for a very short time.',
        etymology: 'From Greek ephēmeros, lasting only one day.',
        first_letter: 'e',
        in_a_sentence: 'The beauty of a rainbow is ephemeral, lasting only minutes.',
        number_of_letters: 9,
        equivalents: 'fleeting, transient, momentary',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
    }
];
async function insertSampleWords() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
    }
    const client = createClient(supabaseUrl, supabaseKey);
    try {
        for (const word of sampleWords) {
            const { error } = await client
                .from('words')
                .upsert([word], { onConflict: 'date' });
            if (error)
                throw error;
        }
        console.log('Successfully inserted sample words!');
    }
    catch (error) {
        console.error('Error inserting sample words:', error);
    }
}
insertSampleWords().catch(console.error);
