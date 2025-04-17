import { getDb } from '../src/config/database/db';

async function resetWords() {
  try {
    const db = getDb();
    console.log('Resetting all words to unassigned state...');
    
    const { error } = await db.client
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