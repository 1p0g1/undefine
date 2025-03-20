import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import { WordService, IWord } from './services/WordService.js';
import promClient from 'prom-client';
import dotenv from 'dotenv';
import { authenticateAdmin } from './auth/authMiddleware.js';
import { login } from './auth/authController.js';

// Load environment variables
dotenv.config();

// Debug logging
console.log('Starting server initialization...');

const app = express();
const port = process.env.PORT || 3001;

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['route', 'method'],
});

// Keep track of server instance
let server: any = null;

// Graceful shutdown function
function shutdown() {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.log('Forcing shutdown...');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

console.log('Setting up middleware...');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Add request logging middleware
app.use(morgan('combined'));
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ route: req.path, method: req.method });
  });
  next();
});

app.use(express.json());

// Enable keep-alive
app.use((req, res, next) => {
  res.set('Connection', 'keep-alive');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// In-memory game state storage
interface GameState {
  word: IWord;
  startTime: Date;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
}

const activeGames = new Map<string, GameState>();

// Get a random word and its definition
app.get('/api/word', async (req, res) => {
  try {
    const word = await WordService.getRandomWord();
    if (!word) {
      return res.status(404).json({ error: 'No words available' });
    }

    // Generate a unique game ID
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Store the game state
    activeGames.set(gameId, {
      word,
      startTime: new Date(),
      guessCount: 0,
      fuzzyCount: 0,
      hintCount: 0
    });

    // Send only the necessary information to start the game
    res.json({
      gameId,
      word: {
        id: word.wordId,
        definition: word.definition,
        partOfSpeech: word.partOfSpeech
      }
    });
  } catch (error) {
    console.error('Error getting random word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the leaderboard entry interface
interface LeaderboardEntry {
  id: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount?: number;
  date: string;
  word: string;
  name?: string;
}

// In-memory leaderboard storage
let leaderboard: LeaderboardEntry[] = [];

// Function to generate dummy leaderboard data
function generateDummyLeaderboardData(word: string, count: number = 20): LeaderboardEntry[] {
  const dummyNames = [
    'SpeedyGuesser', 'WordWizard', 'LexiconMaster', 'QuickThinker', 
    'BrainiacPlayer', 'WordNinja', 'VocabVirtuoso', 'MindReader',
    'ThesaurusRex', 'DictionaryDiva', 'WordSmith', 'LinguistPro',
    'GuessingGuru', 'DefineDevil', 'SyntaxSage', 'EtymologyExpert',
    'PuzzlePro', 'VerbalVirtuoso', 'WordWanderer', 'LexicalLegend'
  ];
  
  const dummyEntries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    const time = 20 + Math.floor(Math.random() * 120);
    const guessCount = 1 + Math.floor(Math.random() * 6);
    const fuzzyCount = Math.floor(Math.random() * 3);
    const hintCount = Math.floor(Math.random() * 4);
    
    dummyEntries.push({
      id: `dummy-${i}-${Date.now()}`,
      time,
      guessCount,
      fuzzyCount,
      hintCount,
      date: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      word,
      name: dummyNames[i % dummyNames.length]
    });
  }
  
  return dummyEntries.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
    return b.fuzzyCount - a.fuzzyCount;
  });
}

// Check if a guess is correct
app.post('/api/guess', async (req, res) => {
  try {
    const { guess, gameId } = req.body;
    
    // Get the game state
    const gameState = activeGames.get(gameId);
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const { word: currentWord } = gameState;
    gameState.guessCount++;
    
    const isCorrect = guess.toLowerCase() === currentWord.word.toLowerCase();
    const isFuzzy = !isCorrect && isFuzzyMatch(guess, currentWord.word);
    const isGameOver = isCorrect || gameState.guessCount >= 6;
    
    if (isFuzzy) {
      gameState.fuzzyCount++;
    }
    
    const fuzzyPositions: number[] = [];
    if (isFuzzy) {
      const guessLetters = guess.toLowerCase().split('');
      const correctLetters = currentWord.word.toLowerCase().split('');
      
      guessLetters.forEach((letter: string, index: number) => {
        if (index < correctLetters.length && letter === correctLetters[index]) {
          fuzzyPositions.push(index);
        }
      });
      
      if (fuzzyPositions.length === 0) {
        fuzzyPositions.push(0);
      }
    }
    
    if (isCorrect || isGameOver) {
      // Add to leaderboard if game is over
      if (isCorrect) {
        const timeTaken = Date.now() - gameState.startTime.getTime();
        const entry: LeaderboardEntry = {
          id: gameId,
          time: Math.floor(timeTaken / 1000),
          guessCount: gameState.guessCount,
          fuzzyCount: gameState.fuzzyCount,
          hintCount: gameState.hintCount,
          date: new Date().toISOString(),
          word: currentWord.word
        };
        
        leaderboard.push(entry);
        leaderboard = leaderboard
          .filter(entry => entry.word === currentWord.word)
          .sort((a, b) => {
            if (a.time !== b.time) return a.time - b.time;
            if (a.guessCount !== b.guessCount) return a.guessCount - b.guessCount;
            return b.fuzzyCount - a.fuzzyCount;
          });
      }
      
      // Clean up the game state
      activeGames.delete(gameId);
    }
    
    res.json({ 
      isCorrect,
      correctWord: isGameOver ? currentWord.word : undefined,
      guessedWord: guess,
      isFuzzy,
      fuzzyPositions,
      remainingGuesses: 6 - gameState.guessCount,
      leaderboardRank: isCorrect ? leaderboard.findIndex(e => e.id === gameId) + 1 : undefined
    });
  } catch (error) {
    console.error('Error in /api/guess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up old game sessions periodically
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [gameId, state] of activeGames.entries()) {
    if (state.startTime.getTime() < oneHourAgo) {
      activeGames.delete(gameId);
    }
  }
}, 15 * 60 * 1000); // Run every 15 minutes

// Add basic test routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.post('/api/auth/login', login);

// Validate token endpoint
app.get('/api/auth/validate', authenticateAdmin, (req, res) => {
  res.json({ valid: true });
});

// Get all words - no auth required for now
app.get('/api/admin/words', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await WordService.getWords(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error getting words:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single word
app.get('/api/admin/words/:word', async (req, res) => {
  try {
    const word = await WordService.getWord(req.params.word);
    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }
    res.json({ word });
  } catch (error) {
    console.error('Error getting word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new word
app.post('/api/admin/words', async (req, res) => {
  try {
    const { word, partOfSpeech, definition, alternateDefinition } = req.body;
    
    if (!word || !partOfSpeech || !definition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newWord = await WordService.addWord({
      word,
      partOfSpeech,
      definition,
      alternateDefinition
    });

    res.status(201).json({ word: newWord });
  } catch (error) {
    console.error('Error adding word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a word
app.put('/api/admin/words/:wordId', async (req, res) => {
  try {
    const { word, partOfSpeech, definition, alternateDefinition } = req.body;
    
    if (!req.params.wordId) {
      return res.status(400).json({ error: 'Word ID is required' });
    }

    const updatedWord = await WordService.updateWord(req.params.wordId, {
      word,
      partOfSpeech,
      definition,
      alternateDefinition
    });

    res.json({ word: updatedWord });
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a word
app.delete('/api/admin/words/:wordId', async (req, res) => {
  try {
    if (!req.params.wordId) {
      return res.status(400).json({ error: 'Word ID is required' });
    }

    const deleted = await WordService.deleteWord(req.params.wordId);
    if (!deleted) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search words
app.get('/api/admin/words/search/:query', async (req, res) => {
  try {
    const words = await WordService.searchWords(req.params.query);
    res.json({ words });
  } catch (error) {
    console.error('Error searching words:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to check if words are similar using fuzzy matching
function isFuzzyMatch(guess: string, correct: string): boolean {
  try {
    const normalizedGuess = guess.toLowerCase();
    const normalizedCorrect = correct.toLowerCase();

    if (normalizedCorrect.startsWith(normalizedGuess) || normalizedGuess.startsWith(normalizedCorrect)) {
      return true;
    }

    const minLength = Math.min(normalizedGuess.length, normalizedCorrect.length);
    const commonPrefixLength = [...Array(minLength)].findIndex((_, i) => 
      normalizedGuess[i] !== normalizedCorrect[i]
    );
    
    if (commonPrefixLength > 4) {
      return true;
    }

    const matrix: number[][] = [];
    for (let i = 0; i <= normalizedGuess.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= normalizedCorrect.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= normalizedGuess.length; i++) {
      for (let j = 1; j <= normalizedCorrect.length; j++) {
        if (normalizedGuess[i-1] === normalizedCorrect[j-1]) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1,
            matrix[i][j-1] + 1,
            matrix[i-1][j] + 1
          );
        }
      }
    }

    const distance = matrix[normalizedGuess.length][normalizedCorrect.length];
    const maxLength = Math.max(normalizedGuess.length, normalizedCorrect.length);
    const threshold = Math.max(2, Math.floor(maxLength * 0.3));
    
    return distance <= threshold;
  } catch (error) {
    console.error('Error in fuzzy matching:', error);
    return false;
  }
}

// Start server
const startServer = async () => {
  console.log('Starting server initialization...');
  
  try {
    await connectDB();
    
    const serverPort = typeof port === 'string' ? parseInt(port) : port;
    server = app.listen(serverPort, 'localhost', () => {
      console.log('\n=== Server Status ===');
      console.log(`Time: ${new Date().toISOString()}`);
      console.log(`Port: ${serverPort}`);
      console.log(`URL: http://localhost:${serverPort}`);
      console.log('\nTest these endpoints:');
      console.log(`1. http://localhost:${serverPort}/`);
      console.log(`2. http://localhost:${serverPort}/test`);
      console.log(`3. http://localhost:${serverPort}/health`);
      console.log('==================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
}); 