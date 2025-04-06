import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { db } from './config/database/db.js';
import type { 
  LeaderboardEntry, 
  UserStats, 
  Word,
  DailyMetrics,
  StreakLeader,
  User,
  UserCredentials,
  AuthResult,
  GameSession
} from '@reversedefine/shared-types';
import { GameService } from './services/GameService.js';
import { WordService } from './services/WordService.js';
import { StatsService } from './services/StatsService.js';
import { authRouter } from './auth/authRoutes.js';
import { gameRouter } from './routes/game.js';
import { wordRouter } from './routes/word.js';
import { statsRouter } from './routes/stats.js';
import { hintRouter } from './routes/hint.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { validateEnv } from './config/env.js';
import { errorHandler, notFoundHandler, ApiError } from './middleware/errorHandler.js';
import { 
  validateWord, 
  validateUserStats, 
  validateDailyMetrics, 
  validateLeaderboardEntry, 
  validateStreakLeader,
  validateGameSession
} from './utils/responseValidator.js';
import { logger } from './utils/logger.js';

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
async function initDatabase() {
  try {
    console.log('Connecting to database...');
    await db.connect();
    console.log('Database connection established');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.log('Continuing with local data only');
  }
}

// Store active games
interface ActiveGame {
  word: string;
  wordId: string;
  startTime: Date;
  guessCount: number;
  hintsUsed: number;
  userId?: string;
  fuzzyMatches: number;
  revealedHints: Set<string>;
  userEmail?: string;
}

const activeGames = new Map<string, ActiveGame>();

// Make activeGames accessible to routes
app.locals.activeGames = activeGames;

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('[/api/test] Received test request');
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Get a random word
app.get('/api/word', async (req, res, next) => {
  try {
    const word = await db.getRandomWord();
    if (!word) {
      throw new ApiError(404, 'No words available');
    }
    
    // Create a new game
    const gameId = uuidv4();
    activeGames.set(gameId, {
      word: word.word,
      wordId: word.wordId,
      startTime: new Date(),
      guessCount: 0,
      hintsUsed: 0,
      fuzzyMatches: 0,
      revealedHints: new Set()
    });
    
    res.json({ 
      gameId,
      word: word.word
    });
  } catch (error) {
    next(error);
  }
});

// Get daily word
app.get('/api/daily', async (req, res, next) => {
  try {
    const word = await db.getDailyWord();
    if (!word) {
      throw new ApiError(404, 'No daily word available');
    }
    
    // Create a new game
    const gameId = uuidv4();
    activeGames.set(gameId, {
      word: word.word,
      wordId: word.wordId,
      startTime: new Date(),
      guessCount: 0,
      hintsUsed: 0,
      fuzzyMatches: 0,
      revealedHints: new Set()
    });
    
    res.json({ 
      gameId,
      word: word.word
    });
  } catch (error) {
    next(error);
  }
});

// Process a guess
app.post('/api/guess', async (req, res, next) => {
  try {
    const { gameId, guess } = req.body;
    
    if (!gameId || !guess) {
      throw new ApiError(400, 'Missing gameId or guess');
    }
    
    const game = activeGames.get(gameId);
    if (!game) {
      throw new ApiError(404, 'Game not found');
    }
    
    game.guessCount++;
    
    // Check if guess is correct
    const isCorrect = guess.toLowerCase() === game.word.toLowerCase();
    
    if (isCorrect) {
      // Game won
      activeGames.delete(gameId);
      
      // Update stats if user is logged in
      if (game.userEmail) {
        try {
          await StatsService.updateUserStats(game.userEmail, true, game.guessCount, Date.now() - game.startTime.getTime());
        } catch (error) {
          console.error('Error updating user stats:', error);
        }
      }
      
      return res.json({ 
        correct: true, 
        gameOver: true,
        word: game.word
      });
    }
    
    // Check if max guesses reached
    const maxGuesses = 6;
    if (game.guessCount >= maxGuesses) {
      // Game lost
      activeGames.delete(gameId);
      
      // Update stats if user is logged in
      if (game.userEmail) {
        try {
          await StatsService.updateUserStats(game.userEmail, false, game.guessCount, Date.now() - game.startTime.getTime());
        } catch (error) {
          console.error('Error updating user stats:', error);
        }
      }
      
      return res.json({ 
        correct: false, 
        gameOver: true,
        word: game.word
      });
    }
    
    // Game continues
    res.json({ 
      correct: false, 
      gameOver: false
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const entries = await db.getDailyLeaderboard();
    
    // Format the entries
    const formattedEntries = entries.map((entry, index) => ({
      rank: index + 1,
      userEmail: entry.userEmail,
      time: entry.timeTaken,
      guesses: entry.guessesUsed,
      fuzzy: entry.fuzzyMatches,
      hints: entry.hintsUsed
    }));
    
    res.json(formattedEntries);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get a hint
app.get('/api/hint/:gameId/:type', async (req, res, next) => {
  try {
    const { gameId, type } = req.params;
    
    if (!gameId || !type) {
      throw new ApiError(400, 'Missing gameId or hint type');
    }
    
    const game = activeGames.get(gameId);
    if (!game) {
      throw new ApiError(404, 'Game not found');
    }
    
    // Check if hint already revealed
    if (game.revealedHints.has(type)) {
      throw new ApiError(400, 'Hint already revealed');
    }
    
    // Get word details
    const word = await db.getWord(game.wordId);
    if (!word) {
      throw new ApiError(404, 'Word not found');
    }
    
    // Mark hint as revealed
    game.revealedHints.add(type);
    game.hintsUsed++;
    
    // Return hint based on type
    let hint = '';
    switch (type) {
      case 'D': // Definition
        hint = word.definition;
        break;
      case 'E': // Etymology
        hint = word.etymology || 'No etymology available';
        break;
      case 'F': // First letter
        hint = word.firstLetter;
        break;
      case 'I': // Is plural
        hint = word.isPlural ? 'This word is plural' : 'This word is not plural';
        break;
      case 'N': // Number of syllables
        hint = `This word has ${word.numSyllables || 'unknown'} syllables`;
        break;
      case 'S': // Example sentence
        hint = word.exampleSentence || 'No example sentence available';
        break;
      default:
        throw new ApiError(400, 'Invalid hint type');
    }
    
    res.json({ hint });
  } catch (error) {
    next(error);
  }
});

// Get user stats
app.get('/api/stats/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      throw new ApiError(400, 'Missing username');
    }
    
    const stats = await StatsService.getUserStats(username);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get daily stats
app.get('/api/stats/daily', async (req, res, next) => {
  try {
    const stats = await StatsService.getDailyStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get streak leaders
app.get('/api/leaderboard/streaks', async (req, res, next) => {
  try {
    const leaders = await StatsService.getStreakLeaders();
    res.json(leaders);
  } catch (error) {
    next(error);
  }
});

// Get daily leaderboard
app.get('/api/leaderboard/daily', async (req, res, next) => {
  try {
    const leaderboard = await db.getDailyLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

// Get all-time leaderboard
app.get('/api/leaderboard/alltime', async (req, res, next) => {
  try {
    const leaderboard = await db.getAllTimeLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

// Submit to leaderboard
app.post('/api/leaderboard', async (req, res, next) => {
  try {
    const { username, wordId, word, timeTaken, guessesUsed, fuzzyMatches, hintsUsed } = req.body;
    
    if (!username || !wordId || !word || timeTaken === undefined || guessesUsed === undefined) {
      throw new ApiError(400, 'Missing required fields');
    }
    
    const entry = await db.addLeaderboardEntry({
      username,
      wordId,
      word,
      timeTaken,
      guessesUsed,
      fuzzyMatches: fuzzyMatches || 0,
      hintsUsed: hintsUsed || 0
    });
    
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

// Start a game
app.post('/api/game/start', async (req, res, next) => {
  try {
    const { userEmail } = req.body;
    
    const gameSession = await db.startGame(userEmail);
    res.json(gameSession);
  } catch (error) {
    next(error);
  }
});

// Process a guess for a game session
app.post('/api/game/:gameId/guess', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { guess, userEmail } = req.body;
    
    if (!gameId || !guess) {
      throw new ApiError(400, 'Missing gameId or guess');
    }
    
    const result = await db.processGuess(gameId, guess, userEmail);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// End a game
app.post('/api/game/:gameId/end', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { won } = req.body;
    
    if (!gameId || won === undefined) {
      throw new ApiError(400, 'Missing gameId or won status');
    }
    
    await db.endGame(gameId, won);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get a game session
app.get('/api/game/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    
    if (!gameId) {
      throw new ApiError(400, 'Missing gameId');
    }
    
    const gameSession = await db.getGameSession(gameId);
    if (!gameSession) {
      throw new ApiError(404, 'Game session not found');
    }
    
    res.json(gameSession);
  } catch (error) {
    next(error);
  }
});

// Use hint router
app.use('/api/hint', hintRouter);

// Start the server
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer(); 