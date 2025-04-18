import { getDb, initDb } from '../config/database/db.js';
import { config } from 'dotenv';
import path from 'path';
import { hasClient, ExtendedDatabaseClient } from '../types/databaseClient.js';

// Load environment variables from root .env
config({ path: path.resolve(process.cwd(), '../../.env') });

interface WordData {
  id: string;
  word: string;
  date: string | null;
}

async function resetDailyWords() {
  try {
    await initDb();
    const db = getDb();
    
    // Check if db has client property
    if (!hasClient(db)) {
      throw new Error('Database client does not support direct access');
    }
    
    // Type assertion to use client property
    const extendedDb = db as ExtendedDatabaseClient;
    
    // Get all words with dates assigned
    const { data: words, error: fetchError } = await extendedDb.client
      .from('words')
      .select('id, word, date')
      .not('date', 'is', null);

    if (fetchError) throw fetchError;

    console.log('Found words with dates:', words?.length || 0);
    if (words) {
      console.log('Words with dates:', words.map((w: WordData) => ({ id: w.id, word: w.word, date: w.date })));
    }

    // Reset all date assignments
    const { error: updateError } = await extendedDb.client
      .from('words')
      .update({ date: null })
      .not('date', 'is', null);

    if (updateError) throw updateError;

    console.log('Successfully reset all daily word assignments!');
  } catch (error) {
    console.error('Error resetting daily words:', error);
  }
}

resetDailyWords(); 