import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: '.env.development' });
async function setupSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
    }
    const client = createClient(supabaseUrl, supabaseKey);
    try {
        // Create words table
        const { error: wordsError } = await client
            .from('words')
            .insert([
            {
                word: 'cogitate',
                definition: 'To reason, argue, or think carefully and thoroughly.',
                etymology: 'From Latin cogitare, to think, consider, or deliberate.',
                first_letter: 'c',
                in_a_sentence: 'She cogitated on the problem for hours before finding a solution.',
                number_of_letters: 8,
                equivalents: 'contemplate, ponder, deliberate',
                date: new Date().toISOString().split('T')[0] // Today's date
            }
        ])
            .select();
        if (wordsError) {
            console.error('Error creating words table:', wordsError);
            // If the error is that the table doesn't exist, create it
            if (wordsError.code === '42P01') {
                const { error: createError } = await client.rpc('create_table', {
                    table_sql: `
            CREATE TABLE IF NOT EXISTS words (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              word TEXT NOT NULL,
              definition TEXT NOT NULL,
              etymology TEXT,
              first_letter CHAR(1),
              in_a_sentence TEXT,
              number_of_letters INTEGER,
              equivalents TEXT,
              date DATE UNIQUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
            );
          `
                });
                if (createError)
                    throw createError;
            }
            else {
                throw wordsError;
            }
        }
        // Create user_stats table
        const { error: statsError } = await client
            .from('user_stats')
            .insert([
            {
                username: 'test_user',
                games_played: 0,
                games_won: 0,
                average_guesses: 0,
                average_time: 0,
                current_streak: 0,
                longest_streak: 0,
                last_played_at: new Date().toISOString()
            }
        ])
            .select();
        if (statsError) {
            console.error('Error creating user_stats table:', statsError);
            // If the error is that the table doesn't exist, create it
            if (statsError.code === '42P01') {
                const { error: createError } = await client.rpc('create_table', {
                    table_sql: `
            CREATE TABLE IF NOT EXISTS user_stats (
              username TEXT PRIMARY KEY,
              games_played INTEGER DEFAULT 0,
              games_won INTEGER DEFAULT 0,
              average_guesses FLOAT DEFAULT 0,
              average_time INTEGER DEFAULT 0,
              current_streak INTEGER DEFAULT 0,
              longest_streak INTEGER DEFAULT 0,
              last_played_at TIMESTAMP WITH TIME ZONE
            );
          `
                });
                if (createError)
                    throw createError;
            }
            else {
                throw statsError;
            }
        }
        console.log('Successfully set up Supabase tables!');
    }
    catch (error) {
        console.error('Error setting up Supabase:', error);
    }
}
setupSupabase().catch(console.error);
//# sourceMappingURL=setup-supabase.js.map