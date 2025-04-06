import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './config/database/index.js';
import { WordService } from './services/WordService.js';
import promClient from 'prom-client';
import { login } from './auth/authController.js';
import { connectionManager } from './config/snowflake.js';
import { GameService } from './services/GameService.js';
import { StatsService } from './services/StatsService.js';
import { authenticateUser } from './auth/authMiddleware.js';
import { AuthRequest } from './auth/authTypes.js';

// Environment variable validation
function validateEnvironmentVariables(): void {
  // For debug/development mode, don't validate all env vars
  if (process.env.DEBUG === '1') {
    console.log('Running in DEBUG mode - skipping full environment variable validation');
    return;
  }

  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'REDIS_URI',
    'SNOWFLAKE_ACCOUNT',
    'SNOWFLAKE_USERNAME',
    'SNOWFLAKE_PASSWORD',
    'SNOWFLAKE_DATABASE',
    'SNOWFLAKE_WAREHOUSE',
    'SNOWFLAKE_POOL_SIZE',
    'SNOWFLAKE_CONNECTION_TIMEOUT',
    'JWT_SECRET',
    'DB_PROVIDER'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    throw new Error('Missing required environment variables. Please check your .env file.');
  }

  const dbProvider = process.env.DB_PROVIDER?.toLowerCase();
  if (dbProvider && !['snowflake', 'mongodb', 'mock'].includes(dbProvider)) {
    throw new Error(`Unsupported database provider: ${dbProvider}. Must be either 'snowflake', 'mongodb', or 'mock'`);
  }

  console.log('✅ All environment variables validated. Server starting...');
}

// Debug logging
console.log('Starting server initialization...');

// Validate environment variables before proceeding
validateEnvironmentVariables();

const app = express();
const port = process.env.PORT;
if (!port) {
  throw new Error('Missing PORT environment variable. Please check your .env file.');
}

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

// API test endpoint that doesn't require authentication
app.get('/api/test', (req, res) => {
  console.log('[/api/test] Received test request');
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    message: 'API is accessible',
    timestamp: new Date().toISOString()
  });
});

// In-memory game state storage
interface GameState {
  word: {
    wordId: string;
    word: string;
    definition: string;
    partOfSpeech: string;
  };
  startTime: Date;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
}

const activeGames = new Map<string, GameState>();

// Get a random word and its definition
app.get('/api/word', authenticateUser, async (req: AuthRequest, res) => {
  try {
    console.log('[/api/word] Starting request for user:', req.user?.email);
    
    // Use the new getTodayWord method which marks the word as used automatically
    const word = await GameService.getTodayWord();
    
    // Create a game with this word
    const gameResponse = await GameService.startGame(req.user!.email);
    
    console.log('[/api/word] Successfully created game:', {
      gameId: gameResponse.gameId,
      wordDefinition: gameResponse.word.definition.substring(0, 30) + '...'
    });
    
    res.json(gameResponse);
  } catch (error) {
    console.error('[/api/word] Error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      user: req.user?.email
    });
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
app.post('/api/guess', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { guess, gameId } = req.body;
    
    console.log('[/api/guess] Processing guess:', {
      gameId: gameId,
      guess: guess,
      user: req.user?.email
    });
    
    if (!gameId) {
      console.error('[/api/guess] Missing gameId in request');
      return res.status(400).json({ error: 'Missing gameId parameter' });
    }
    
    if (!guess) {
      console.error('[/api/guess] Missing guess in request');
      return res.status(400).json({ error: 'Missing guess parameter' });
    }
    
    const result = await GameService.processGuess(gameId, guess);
    
    console.log('[/api/guess] Processed guess result:', {
      gameId: gameId,
      guess: guess,
      isCorrect: result.isCorrect,
      isFuzzy: result.isFuzzy
    });
    
    res.json(result);
  } catch (error: unknown) {
    console.error('[/api/guess] Error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    
    if (error instanceof Error && error.message === 'Game not found') {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up old game sessions periodically
setInterval(() => {
  GameService.cleanupOldGames();
}, 15 * 60 * 1000); // Run every 15 minutes

// Add basic test routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/test', (req, res) => {
  const NODE_ENV = process.env.NODE_ENV;
  if (!NODE_ENV) {
    throw new Error('Missing NODE_ENV environment variable. Please check your .env file.');
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: NODE_ENV
  });
});

// Authentication routes
app.post('/api/auth/login', login);

// Validate token endpoint
app.get('/api/auth/validate', (req, res) => {
  res.json({ valid: true });
});

// Get daily statistics
app.get('/api/stats/daily', async (req, res) => {
  try {
    const stats = await StatsService.getDailyStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting daily stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const startServer = async () => {
  console.log('Starting server initialization...');
  
  try {
    await initializeDatabase();
    
    const serverPort = parseInt(process.env.PORT || '3001', 10);
    server = app.listen(serverPort, () => {
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