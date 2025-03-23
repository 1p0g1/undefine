import { db } from '../src/config/database/index.js';
import { Word, LeaderboardEntry, UserStats } from '../src/config/database/index.js';

async function testDatabaseClient() {
  console.log('\n=== Database Client Test ===');
  
  // Log current provider
  const provider = db instanceof (await import('../src/config/database/SnowflakeClient.js')).SnowflakeClient ? 'Snowflake' : 'MongoDB';
  console.log(`Current Provider: ${provider}`);

  try {
    // Test getRandomWord
    console.log('\nTesting getRandomWord...');
    const randomWord = await db.getRandomWord();
    console.log('Random Word Result:', {
      success: !!randomWord,
      hasWord: !!randomWord.word,
      hasDefinition: !!randomWord.definition,
      hasPartOfSpeech: !!randomWord.partOfSpeech
    });

    // Test getLeaderboard
    console.log('\nTesting getLeaderboard...');
    const leaderboard = await db.getLeaderboard();
    console.log('Leaderboard Result:', {
      success: !!leaderboard,
      entryCount: leaderboard.length,
      hasEntries: leaderboard.length > 0
    });

    // Test getUserStats
    console.log('\nTesting getUserStats...');
    const testUser = 'test_user';
    const userStats = await db.getUserStats(testUser);
    console.log('User Stats Result:', {
      success: !!userStats,
      hasRequiredFields: {
        games_played: typeof userStats.games_played === 'number',
        average_guesses: typeof userStats.average_guesses === 'number',
        current_streak: typeof userStats.current_streak === 'number'
      }
    });

    // Test connection health if Snowflake
    if (provider === 'Snowflake') {
      console.log('\nTesting Snowflake Connection Health...');
      const snowflakeClient = db as any;
      if (snowflakeClient.checkConnectionHealth) {
        const health = await snowflakeClient.checkConnectionHealth();
        console.log('Connection Health:', health);
      }
    }

    console.log('\n✅ All tests completed successfully');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testDatabaseClient(); 