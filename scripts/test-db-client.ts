import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseClient() {
  console.log('\n=== Supabase Client Test ===');
  
  try {
    // Test connection
    console.log('\nTesting Supabase connection...');
    const { data: testData, error: testError } = await supabase.from('words').select('count(*)');
    if (testError) throw testError;
    console.log('✅ Connection successful');

    // Test words table
    console.log('\nTesting words table...');
    const { data: word, error: wordError } = await supabase
      .from('words')
      .select('*')
      .limit(1)
      .single();
    
    if (wordError) throw wordError;
    console.log('Word Result:', {
      success: !!word,
      hasWord: !!word?.word,
      hasDefinition: !!word?.definition,
      hasClues: {
        D: !!word?.definition,
        E: !!word?.etymology,
        F: !!word?.first_letter,
        I: !!word?.in_a_sentence,
        N: !!word?.number_of_letters,
        E2: !!word?.equivalents
      }
    });

    // Test game_sessions table
    console.log('\nTesting game_sessions table...');
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .limit(1)
      .single();
    
    console.log('Game Session Result:', {
      success: !!session,
      hasRequiredFields: {
        id: !!session?.id,
        word_id: !!session?.word_id,
        is_complete: typeof session?.is_complete === 'boolean'
      }
    });

    // Test user_stats table
    console.log('\nTesting user_stats table...');
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .limit(1)
      .single();
    
    console.log('User Stats Result:', {
      success: !!stats,
      hasRequiredFields: {
        player_id: !!stats?.player_id,
        games_played: typeof stats?.games_played === 'number',
        current_streak: typeof stats?.current_streak === 'number'
      }
    });

    console.log('\n✅ All Supabase tests completed successfully');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testDatabaseClient(); 