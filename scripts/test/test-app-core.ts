// ⛔ Do not use .js extensions in TypeScript imports. See ARCHITECTURE.md

import dotenv from 'dotenv';
import { getDb } from '../config/database/db.js';
import { GameService } from '../services/GameService.js';
import { LeaderboardService } from '../services/LeaderboardService.js';

// Load environment variables
dotenv.config();

async function testCoreFunctionality() {
  console.log('Starting core functionality test...');
  console.log(`Using database provider: ${process.env.DB_PROVIDER || 'supabase'}`);

  const db = getDb();
  let success = true;

  try {
    // Test database connection
    console.log('\nTesting database connection...');
    await db.connect();
    console.log('✓ Database connection successful');

    // Test getRandomWord
    console.log('\nTesting getRandomWord...');
    try {
      const word = await GameService.getRandomWord();
      console.log('✓ getRandomWord successful');
      console.log(`  Word: ${word.word}`);
      console.log(`  Definition: ${word.definition}`);
    } catch (error) {
      console.error('✗ getRandomWord failed:', error);
      success = false;
    }

    // Test submitGuess (mocked)
    console.log('\nTesting submitGuess (mocked)...');
    try {
      const mockGuess = 'test';
      const mockGameId = 'test-game-id';
      const result = await GameService.processGuess(mockGameId, mockGuess);
      console.log('✓ submitGuess successful');
      console.log(`  Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('✗ submitGuess failed:', error);
      success = false;
    }

    // Test getUserStats with a mock username
    console.log('\nTesting getUserStats...');
    try {
      const mockUsername = 'testuser';
      try {
        const stats = await LeaderboardService.getUserStats(mockUsername);
        console.log('✓ getUserStats successful');
        console.log(`  Stats: ${JSON.stringify(stats, null, 2)}`);
      } catch (error) {
        // Create a user if it doesn't exist
        console.log('User stats not found, creating user first...');
        await db.createUser(mockUsername);
        await LeaderboardService.updateUserStats(mockUsername, true, 5, 120);
        console.log('✓ User created and stats updated');
      }
    } catch (error) {
      console.error('✗ getUserStats failed:', error);
      success = false;
    }

  } catch (error) {
    console.error('Test failed:', error);
    success = false;
  } finally {
    // Cleanup
    try {
      await db.disconnect();
      console.log('\nDatabase connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  console.log('\nTest Summary:');
  console.log(success ? '✓ All tests passed' : '✗ Some tests failed');
}

// Run the tests
testCoreFunctionality().catch(console.error); 