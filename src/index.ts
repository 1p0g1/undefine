import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config({ path: '.env.development' });

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
import { SupabaseClient } from './config/database/SupabaseClient.js';

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

// Initialize Supabase client
const db = SupabaseClient.getInstance();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Get word endpoint
app.get('/api/word', async (req, res) => {
  try {
    const dailyWord = await db.getDailyWord();
    if (!dailyWord) {
      return res.status(404).json({ error: 'No word available for today' });
    }
    res.json({
      gameId: 'game-' + Date.now(),
      word: {
        id: dailyWord.id,
        definition: dailyWord.definition,
        partOfSpeech: 'verb',
        etymology: dailyWord.etymology,
        firstLetter: dailyWord.first_letter,
        inASentence: dailyWord.in_a_sentence,
        numberOfLetters: dailyWord.number_of_letters,
        equivalents: dailyWord.equivalents
      }
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Failed to fetch word' });
  }
});

// Submit guess endpoint
app.post('/api/guess', async (req, res) => {
  try {
    const { gameId, guess } = req.body;
    if (!gameId || !guess) {
      return res.status(400).json({ error: 'Missing gameId or guess' });
    }

    const session = await db.getGameSession(gameId);
    if (!session) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    const result = await db.processGuess(gameId, guess, session);
    res.json(result);
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Failed to process guess' });
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