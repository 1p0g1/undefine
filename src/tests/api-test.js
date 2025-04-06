/**
 * Simple API test script for Reverse Define
 * 
 * Run with: node src/tests/api-test.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = 'http://localhost:3001/api';
let gameId = null;

async function testApi() {
  console.log('🧪 Starting API tests...\n');
  
  try {
    // Test daily word endpoint
    console.log('Testing /api/daily...');
    const dailyResponse = await fetch(`${API_URL}/daily`);
    const dailyData = await dailyResponse.json();
    
    if (dailyResponse.ok) {
      console.log('✅ /api/daily successful');
      console.log(`   Game ID: ${dailyData.gameId}`);
      console.log(`   Word: ${dailyData.word}`);
      gameId = dailyData.gameId;
    } else {
      console.log(`❌ /api/daily failed: ${dailyData.error?.message || 'Unknown error'}`);
    }
    
    // Test hint endpoint
    if (gameId) {
      console.log('\nTesting /api/hint/:gameId/:type...');
      const hintResponse = await fetch(`${API_URL}/hint/${gameId}/D`);
      const hintData = await hintResponse.json();
      
      if (hintResponse.ok) {
        console.log('✅ /api/hint successful');
        console.log(`   Hint: ${hintData.hint}`);
      } else {
        console.log(`❌ /api/hint failed: ${hintData.error?.message || 'Unknown error'}`);
      }
    }
    
    // Test guess endpoint
    if (gameId) {
      console.log('\nTesting /api/guess...');
      const guessResponse = await fetch(`${API_URL}/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId,
          guess: 'test'
        })
      });
      const guessData = await guessResponse.json();
      
      if (guessResponse.ok) {
        console.log('✅ /api/guess successful');
        console.log(`   Correct: ${guessData.correct}`);
        console.log(`   Game Over: ${guessData.gameOver}`);
      } else {
        console.log(`❌ /api/guess failed: ${guessData.error?.message || 'Unknown error'}`);
      }
    }
    
    // Test stats endpoint
    console.log('\nTesting /api/stats/daily...');
    const statsResponse = await fetch(`${API_URL}/stats/daily`);
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ /api/stats/daily successful');
      console.log(`   Date: ${statsData.date}`);
      console.log(`   Total Plays: ${statsData.totalPlays}`);
    } else {
      console.log(`❌ /api/stats/daily failed: ${statsData.error?.message || 'Unknown error'}`);
    }
    
    // Test leaderboard endpoint
    console.log('\nTesting /api/leaderboard/streaks...');
    const leaderboardResponse = await fetch(`${API_URL}/leaderboard/streaks`);
    const leaderboardData = await leaderboardResponse.json();
    
    if (leaderboardResponse.ok) {
      console.log('✅ /api/leaderboard/streaks successful');
      console.log(`   Found ${leaderboardData.length} streak leaders`);
    } else {
      console.log(`❌ /api/leaderboard/streaks failed: ${leaderboardData.error?.message || 'Unknown error'}`);
    }
    
    console.log('\n✨ API tests completed');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
testApi(); 