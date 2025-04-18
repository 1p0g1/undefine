import { getDb } from '../src/config/database/db.js';
import { hasClient, ExtendedDatabaseClient } from '../src/types/databaseClient.js';

async function resetWords() {
  try {
    const db = getDb();
    console.log('Resetting all words to unassigned state...');
    
    // Check if db has client property
    if (!hasClient(db)) {
      throw new Error('Database client does not support direct access');
    }
    
    // Type assertion to use client property
    const extendedDb = db as ExtendedDatabaseClient;
    
    const { error } = await extendedDb.client
      .from('words')
      .update({ date: null })
      .neq('id', '-1');
      
    if (error) {
      console.error('Error resetting words:', error);
      process.exit(1);
    }
    
    console.log('✅ Successfully reset all words to unassigned state');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

resetWords(); 