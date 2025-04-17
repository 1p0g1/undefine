import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const client = createClient(supabaseUrl, supabaseKey);

  // Sample words to insert
  const sampleWords = [
    {
      word: 'example',
      definition: 'A representative form or pattern',
      etymology: 'From Latin exemplum "sample, pattern"',
      first_letter: 'e',
      in_a_sentence: 'This is an example sentence.',
      number_of_letters: 7,
      equivalents: 'sample, instance, illustration',
      difficulty: 'Easy'
    },
    {
      word: 'define',
      definition: 'State or describe exactly the nature, scope, or meaning of',
      etymology: 'From Latin definire "to limit, determine"',
      first_letter: 'd',
      in_a_sentence: 'Can you define what this word means?',
      number_of_letters: 6,
      equivalents: 'explain, specify, establish',
      difficulty: 'Medium'
    },
    {
      word: 'reverse',
      definition: 'Move backward in direction or position; change to the opposite',
      etymology: 'From Latin reversus "turn back"',
      first_letter: 'r',
      in_a_sentence: 'The car began to reverse out of the driveway.',
      number_of_letters: 7,
      equivalents: 'invert, flip, switch',
      difficulty: 'Medium'
    }
  ];

  try {
    console.log('Inserting sample words...');
    
    // Insert words
    const { data, error } = await client
      .from('words')
      .insert(sampleWords)
      .select();

    if (error) {
      console.error('Error inserting words:', error);
      throw error;
    }

    console.log('Successfully inserted sample words:', data);

  } catch (error) {
    console.error('Error seeding Supabase:', error);
    throw error;
  }
}

seedSupabase().catch(console.error); 