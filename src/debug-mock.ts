import dotenv from 'dotenv';
import { db } from './config/database/index.js';

// Load environment variables first
dotenv.config();

// Simple debug script to test the mock client
async function testMockClient() {
  console.log('Testing mock client...');
  console.log(`Using database provider: ${process.env.DB_PROVIDER}`);
  
  try {
    // Test connection
    console.log('\n1. Testing connection');
    await db.connect();
    console.log('✓ Connection successful');
    
    // Test getRandomWord
    console.log('\n2. Testing getRandomWord');
    const word = await db.getRandomWord();
    console.log('✓ getRandomWord successful');
    console.log(`Word: ${word.word}`);
    console.log(`Definition: ${word.definition}`);
    
    // Test getLeaderboard
    console.log('\n3. Testing getLeaderboard');
    const leaderboard = await db.getLeaderboard();
    console.log('✓ getLeaderboard successful');
    console.log(`Found ${leaderboard.length} entries`);
    
    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    try {
      await db.disconnect();
      console.log('\nDatabase connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

// Run the tests
testMockClient().catch(console.error); 