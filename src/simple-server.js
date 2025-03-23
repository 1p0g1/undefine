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
    
    // Compare the guess with the target word and find matching positions
    const guessLower = guess.toLowerCase();
    const wordLower = gameState.word.toLowerCase();
    
    // For letter-by-letter matching
    for (let i = 0; i < Math.min(guessLower.length, wordLower.length); i++) {
      if (guessLower[i] === wordLower[i]) {
        fuzzyPositions.push(i);
        console.log(`[/api/guess] Match at position ${i}: ${guessLower[i]}`);
      }
    }
    
    // If no positions matched, add the first character position to indicate some kind of match
    if (fuzzyPositions.length === 0 && 
        (guessLower.includes(wordLower.substring(0, 3)) || 
         wordLower.includes(guessLower.substring(0, 3)))) {
      fuzzyPositions.push(0);
      console.log(`[/api/guess] Adding default position 0 for substring match`);
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

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  console.log('[/api/leaderboard] Fetching leaderboard');
  
  try {
    if (process.env.DB_PROVIDER !== 'mock') {
      const leaderboard = await db.getDailyLeaderboard();
      return res.json(leaderboard);
    } else {
      // Return mock leaderboard
      return res.json({
        entries: [
          {
            id: '1',
            username: 'fastest_player',
            word: 'ponder',
            guesses: 2,
            completion_time_seconds: 15,
            used_hint: false,
            completed: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            username: 'second_place',
            word: 'ponder',
            guesses: 3,
            completion_time_seconds: 25,
            used_hint: false,
            completed: true,
            created_at: new Date().toISOString()
          }
        ]
      });
    }
  } catch (error) {
    console.error('[/api/leaderboard] Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
}); 