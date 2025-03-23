import dotenv from 'dotenv';
import { createDatabaseClient } from '../config/database/index.js';
import { GameService } from '../services/GameService.js';
import { LeaderboardService } from '../services/LeaderboardService.js';

// Load environment variables
dotenv.config();

async function testCoreFunctionality() {
  console.log('Starting core functionality test...');
  console.log(`Using database provider: ${process.env.DB_PROVIDER || 'snowflake'}`);

  const db = createDatabaseClient();
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

    // Test getLeaderboard
    console.log('\nTesting getLeaderboard...');
    try {
      const leaderboard = await LeaderboardService.getLeaderboard();
      console.log('✓ getLeaderboard successful');
      console.log(`  Found ${leaderboard.length} entries`);
    } catch (error) {
      console.error('✗ getLeaderboard failed:', error);
      success = false;
    }

    // Test getUserStats through getDailyLeaderboard
    console.log('\nTesting getUserStats...');
    try {
      console.log('Testing leaderboard stats...');
      const stats = await LeaderboardService.getDailyLeaderboard('test@example.com');
      console.log('✓ getUserStats successful');
      console.log(`  Stats: ${JSON.stringify(stats.userStats, null, 2)}`);
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