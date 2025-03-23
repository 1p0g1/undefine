import express from 'express';
import cors from 'cors';
import { db } from './config/database/index.js';
import { v4 as uuidv4 } from 'uuid';

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize database connection
async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await db.connect();
    console.log('Database connection established');
    
    // Check if we're in mock mode or have a real database
    if (process.env.DB_PROVIDER !== 'mock' && db.setupTables) {
      console.log('Setting up database tables...');
      await db.setupTables(false);
      console.log('Tables setup complete');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Continuing with local data only');
  }
}

// Initialize database connection on startup
initDatabase();

// Sample word data (for demonstration)
const wordData = {
  wordId: '12345',
  word: "ponder",
  definition: "To reason, argue, or think carefully and thoroughly.",
  partOfSpeech: "verb",
  alternateDefinition: "To weigh in the mind with thorough consideration or deliberation.",
  letterCount: { 
    count: 6, 
    display: "6 letters" 
  },
  synonyms: ["contemplate", "consider", "reflect", "meditate", "ruminate", "deliberate"]
};

// Store active games
const activeGames = new Map();

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('[/api/test] Received test request');
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    message: 'API is accessible',
    timestamp: new Date().toISOString()
  });
});

// Get a random word
app.get('/api/word', async (req, res) => {
  console.log('[/api/word] Fetching word');
  
  let wordToUse = wordData;
  
  // Try to get a word from the database if not in mock mode
  if (process.env.DB_PROVIDER !== 'mock') {
    try {
      const dbWord = await db.getRandomWord();
      if (dbWord) {
        console.log('[/api/word] Retrieved word from database:', dbWord.wordId);
        wordToUse = dbWord;
      }
    } catch (error) {
      console.error('[/api/word] Error fetching word from database:', error);
      console.log('[/api/word] Falling back to sample word');
    }
  }
  
  const gameId = `game-${Date.now()}`;
  
  // Store the game data
  activeGames.set(gameId, {
    wordId: wordToUse.wordId,
    word: wordToUse.word,
    startTime: new Date(),
    guessCount: 0,
    guesses: [],
    hintsUsed: 0,
    userId: null
  });
  
  // Return the game response
  res.json({
    gameId: gameId,
    word: {
      id: wordToUse.wordId,
      definition: wordToUse.definition,
      partOfSpeech: wordToUse.partOfSpeech,
      alternateDefinition: wordToUse.alternateDefinition,
      letterCount: wordToUse.letterCount,
      synonyms: wordToUse.synonyms
    }
  });
});

// Process a guess
app.post('/api/guess', async (req, res) => {
  const { gameId, guess, userId, userName, hintCount } = req.body;
  
  console.log(`[/api/guess] Processing guess: ${guess} for game: ${gameId}`);
  
  if (!gameId) {
    return res.status(400).json({ error: 'Missing gameId parameter' });
  }
  
  if (!guess) {
    return res.status(400).json({ error: 'Missing guess parameter' });
  }
  
  // Get the game state
  const gameState = activeGames.get(gameId);
  if (!gameState) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Update game state
  gameState.guessCount++;
  gameState.userId = userId || gameState.userId;
  gameState.hintsUsed = hintCount || gameState.hintsUsed;
  
  // Calculate time elapsed
  const elapsedTime = Math.floor((new Date() - gameState.startTime) / 1000);
  
  // Process the guess
  const isCorrect = guess.toLowerCase() === gameState.word.toLowerCase();
  const isFuzzy = !isCorrect && (
    gameState.word.toLowerCase().includes(guess.toLowerCase()) ||
    guess.toLowerCase().includes(gameState.word.toLowerCase().substring(0, 3))
  );
  
  // Calculate fuzzy positions if it's a fuzzy match
  const fuzzyPositions = [];
  
  if (isFuzzy) {
    console.log(`[/api/guess] Fuzzy match detected: ${guess} vs ${gameState.word}`);
    
    // DEFINE boxes are always 6 letters (D, E, F, I, N, E)
    // We need to map our fuzzy matches to these 6 positions
    // For simplicity, we'll just use the current guess count to determine
    // which DEFINE box position to mark as fuzzy
    
    // Get the current DEFINE position based on the guess count (1-indexed)
    // We subtract 1 to make it 0-indexed for the array
    const currentDefinePosition = gameState.guessCount - 1;
    
    // Only add a position if it's within the DEFINE boxes (0-5)
    if (currentDefinePosition >= 0 && currentDefinePosition < 6) {
      fuzzyPositions.push(currentDefinePosition);
      console.log(`[/api/guess] Marking DEFINE position ${currentDefinePosition} as fuzzy`);
    }
  }

  // Store this guess
  gameState.guesses.push({
    guess,
    isCorrect,
    isFuzzy,
    timeElapsed: elapsedTime,
    guessNumber: gameState.guessCount
  });
  
  // Prepare response
  const response = {
    isCorrect,
    correctWord: isCorrect || gameState.guessCount >= 6 ? gameState.word : undefined,
    guessedWord: guess,
    isFuzzy,
    fuzzyPositions: fuzzyPositions,
    remainingGuesses: 6 - gameState.guessCount,
  };
  
  console.log(`[/api/guess] Response: isFuzzy=${isFuzzy}, fuzzyPositions=${JSON.stringify(fuzzyPositions)}`);
  
  // If game is over or correct answer, save metrics to database
  if (isCorrect || gameState.guessCount >= 6) {
    const gameComplete = isCorrect;
    
    // Try to save to database if not in mock mode and we have a user ID
    if (process.env.DB_PROVIDER !== 'mock' && (userId || userName)) {
      try {
        // Save to leaderboard
        await db.addToLeaderboard({
          username: userName || userId || 'anonymous',
          word: gameState.word,
          guesses: gameState.guessCount,
          completion_time_seconds: elapsedTime,
          used_hint: gameState.hintsUsed > 0,
          completed: gameComplete,
          created_at: new Date().toISOString()
        });
        
        // Save individual guesses as metrics
        for (const guessRecord of gameState.guesses) {
          await db.executeQuery(`
            INSERT INTO GAME_METRICS (
              ID, GAME_ID, USER_ID, WORD_ID, GUESS, IS_CORRECT, IS_FUZZY, 
              GUESS_NUMBER, GUESS_TIME_SECONDS, HINTS_USED, CREATED_AT
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
          `, [
            uuidv4(),
            gameId,
            userId || 'anonymous',
            gameState.wordId,
            guessRecord.guess,
            guessRecord.isCorrect,
            guessRecord.isFuzzy,
            guessRecord.guessNumber,
            guessRecord.timeElapsed,
            gameState.hintsUsed,
          ]);
        }
        
        // Get leaderboard rank
        try {
          const rank = await db.getLeaderboardRank(gameId);
          if (rank) {
            response.leaderboardRank = rank;
          }
        } catch (error) {
          console.error('[/api/guess] Error getting leaderboard rank:', error);
        }
        
        console.log('[/api/guess] Game metrics saved to database');
      } catch (error) {
        console.error('[/api/guess] Error saving game metrics:', error);
      }
    } else {
      console.log('[/api/guess] Skipping database save - no database or user ID available');
    }
    
    // Cleanup game state
    activeGames.delete(gameId);
  }
  
  res.json(response);
});

// Get leaderboard data
app.get('/api/leaderboard', (req, res) => {
  console.log('[/api/leaderboard] Request received');
  
  // For early user testing, conditionally disable the leaderboard
  const isLeaderboardEnabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_LEADERBOARD !== 'true';
  
  if (!isLeaderboardEnabled) {
    console.log('[/api/leaderboard] Leaderboard temporarily disabled for early user testing');
    return res.json({
      message: 'Leaderboard temporarily disabled for early user testing',
      entries: []
    });
  }
  
  console.log('[/api/leaderboard] Returning mock leaderboard data');
  
  // Create mock leaderboard data
  const mockEntries = [
    {
      userId: 'user-123',
      userName: 'WordMaster42',
      time: 45,
      guessCount: 2,
      fuzzyCount: 0,
      hintCount: 0
    },
    {
      userId: 'user-456',
      userName: 'CleverGuesser81',
      time: 78,
      guessCount: 3,
      fuzzyCount: 1,
      hintCount: 1
    },
    {
      userId: 'user-789',
      userName: 'VocabWhiz99',
      time: 120,
      guessCount: 4,
      fuzzyCount: 2,
      hintCount: 1
    }
  ];
  
  // Add the current user to the leaderboard if they've correctly guessed a word
  const userEmail = req.query.userEmail;
  if (userEmail) {
    console.log(`[/api/leaderboard] Including user: ${userEmail} in leaderboard`);
    
    // Look for an active game for this user that was correctly guessed
    let userGame = null;
    for (const [gameId, game] of activeGames.entries()) {
      const lastGuess = game.guesses.length > 0 ? game.guesses[game.guesses.length - 1] : null;
      if (game.userId && lastGuess && lastGuess.isCorrect) {
        userGame = game;
        break;
      }
    }
    
    if (userGame) {
      const userEntry = {
        userId: userGame.userId,
        userName: userEmail,
        time: Math.floor((new Date() - userGame.startTime) / 1000),
        guessCount: userGame.guessCount,
        fuzzyCount: userGame.guesses.filter(g => g.isFuzzy).length,
        hintCount: userGame.hintsUsed || 0
      };
      
      // Add user to entries if not already there
      if (!mockEntries.some(entry => entry.userId === userEntry.userId)) {
        mockEntries.push(userEntry);
      }
    }
  }
  
  // Sort entries by time ascending, then by guesses ascending
  mockEntries.sort((a, b) => {
    if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
    return a.time - b.time;
  });
  
  // Find user rank
  let userRank = null;
  if (userEmail) {
    const userIndex = mockEntries.findIndex(entry => entry.userName === userEmail);
    if (userIndex !== -1) {
      userRank = userIndex + 1;
    }
  }
  
  // Create mock user stats
  const userStats = {
    gamesPlayed: 12,
    averageGuesses: 3.5,
    averageTime: 95,
    bestTime: 32,
    currentStreak: 3,
    longestStreak: 7,
    topTenCount: 5
  };
  
  // Return the leaderboard data
  res.json({
    entries: mockEntries,
    userRank,
    userStats,
    totalPlayers: mockEntries.length
  });
});

// Get hint for a word
app.get('/api/hint/:gameId', async (req, res) => {
  // ... existing code ...
});

// Simple API endpoint to check streak status for a user
app.get('/api/streak-status', async (req, res) => {
  const username = req.query.username;
  
  if (!username) {
    return res.status(400).json({ error: 'Username parameter required' });
  }
  
  console.log(`[/api/streak-status] Checking streak status for user: ${username}`);
  
  try {
    const stats = await db.getUserStats(username);
    
    console.log(`[/api/streak-status] User streak info:`, {
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      username
    });
    
    return res.json({
      status: 'success',
      streakInfo: {
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak,
        lastUpdated: stats.last_updated
      }
    });
  } catch (error) {
    console.error('[/api/streak-status] Error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      username
    });
    
    return res.status(500).json({ 
      error: 'Could not retrieve streak information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Shutdown handler
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (process.env.DB_PROVIDER !== 'mock') {
    try {
      await db.disconnect();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
  process.exit(0);
});

// Start the server
app.listen(port, () => {
  console.log(`Simple API server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log(`  GET  /api/test - Test the API`);
  console.log(`  GET  /api/word - Get a random word`);
  console.log(`  POST /api/guess - Submit a guess`);
  console.log(`  GET  /api/leaderboard - Get leaderboard`);
  console.log(`  GET  /api/streak-status?username=<email> - Check streak status`);
}); 