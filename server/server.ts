import express from 'express';
import cors from 'cors';
import { SupabaseClient } from './SupabaseClient';
import type { WordData } from '@undefine/shared-types';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import { env } from './config/env';
// Unused imports commented out
// import crypto from 'crypto';
// import { GameService } from './services/GameService.js';
// import { StatsService } from './services/StatsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Environment:', {
  nodeEnv: env.nodeEnv,
  port: env.port,
  isDevelopment: env.isDevelopment
});

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const app = express();

// Initialize Supabase client
const db = SupabaseClient.getInstance();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Get word endpoint
app.get('/api/word', async (req, res) => {
  try {
    const session = await db.startGame();
    if (!session.success || !session.data) {
      res.status(404).json({ error: 'Failed to create game session' });
      return;
    }
    
    const wordResult = await db.getDailyWord();
    if (!wordResult.success || !wordResult.data) {
      res.status(404).json({ error: 'No word found for today' });
      return;
    }
    
    res.json({ 
      gameId: session.data.id,
      word: wordResult.data
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get random word endpoint (alias for daily word)
app.get('/api/word/random', async (req, res) => {
  try {
    const session = await db.startGame();
    if (!session.success || !session.data) {
      res.status(404).json({ error: 'Failed to create game session' });
      return;
    }
    
    const wordResult = await db.getDailyWord();
    if (!wordResult.success || !wordResult.data) {
      res.status(404).json({ error: 'No word found for today' });
      return;
    }
    
    res.json({ 
      word: wordResult.data,
      gameId: session.data.id
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit guess endpoint
app.post('/api/guess', async (req, res) => {
  const { gameId, guess } = req.body;
  
  if (!gameId || !guess) {
    res.status(400).json({ error: 'Missing gameId or guess' });
    return;
  }

  try {
    const sessionResult = await db.getGameSession(gameId);
    if (!sessionResult.success || !sessionResult.data) {
      res.status(404).json({ error: 'Game session not found' });
      return;
    }

    const result = await db.processGuess(gameId, guess, sessionResult.data);
    if (!result.success) {
      res.status(400).json({ error: result.error?.message || 'Unknown error occurred' });
      return;
    }
    res.json(result.data);
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
}); 