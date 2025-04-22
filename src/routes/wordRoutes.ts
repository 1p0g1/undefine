import { Router } from 'express';
import { getDb } from '../config/database/db.js';
import { ClueType, GuessResult, Word, Result } from '../../packages/shared-types/src/index.js';

const router = Router();

// Add temporary debug endpoint
router.get('/debug-connection', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Testing database connection...');
    console.log('Environment:', {
      DB_PROVIDER: process.env.DB_PROVIDER,
      SUPABASE_URL: process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'
    });
    
    const db = getDb();
    console.log('Database client type:', db.constructor.name);
    
    console.log('Attempting to fetch a word from database...');
    const word = await db.getDailyWord();
    
    res.json({
      success: true,
      environmentCheck: {
        dbProvider: process.env.DB_PROVIDER,
        supabaseUrlSet: !!process.env.SUPABASE_URL,
        supabaseKeySet: !!process.env.SUPABASE_ANON_KEY
      },
      word: word ? {
        id: word.id,
        wordValue: word.word,
        definition: word.definition && word.definition.substring(0, 20) + '...'
      } : null
    });
  } catch (error) {
    console.error('🔥 DEBUG: Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: String(error),
      stack: (error as Error).stack,
      environmentCheck: {
        dbProvider: process.env.DB_PROVIDER,
        supabaseUrlSet: !!process.env.SUPABASE_URL,
        supabaseKeySet: !!process.env.SUPABASE_ANON_KEY
      }
    });
  }
});

// New route for getting a random word for testing
router.get('/random', async (req, res) => {
  try {
    console.log('⚠️ TESTING ONLY: Fetching random word for test/development purposes');
    
    const db = getDb();
    const word = await db.getRandomWord();
    if (!word) {
      console.log('No random word found in database');
      return res.status(404).json({ error: 'No random word found' });
    }
    
    console.log('Random word found:', { id: word.id, word: word.word });
    const gameSession = await db.startGame();

    // Return in the same format as the /word endpoint
    res.json({ 
      gameId: gameSession.id,
      word: {
        id: word.id,
        word: word.word,
        definition: word.definition,
        clues: {
          D: word.definition,
          E: word.etymology || 'No etymology available',
          F: word.first_letter || '',
          I: word.in_a_sentence || 'No example sentence available',
          N: word.number_of_letters || 0,
          E2: word.equivalents || []
        }
      }
    });
  } catch (error) {
    console.error('Error getting random word:', error);
    res.status(500).json({ error: 'Failed to get random word' });
  }
});

router.get('/word', async (req, res) => {
  try {
    console.log('Attempting to get a word...');
    const word = await getDb().getDailyWord();
    if (!word) {
      console.log('No word found in database');
      return res.status(404).json({ error: 'No word found' });
    }
    
    console.log('Word found:', { id: word.id, word: word.word });
    const gameSession = await getDb().startGame();

    res.json({ 
      gameId: gameSession.id,
      word: {
        id: word.id,
        word: word.word,
        definition: word.definition,
        clues: {
          D: word.definition,
          E: word.etymology || 'No etymology available',
          F: word.first_letter || '',
          I: word.in_a_sentence || 'No example sentence available',
          N: word.number_of_letters || 0,
          E2: word.equivalents || []
        }
      }
    });
  } catch (error) {
    console.error('Error getting word:', error);
    res.status(500).json({ error: 'Failed to get word' });
  }
});

router.post('/guess', async (req, res) => {
  try {
    const { gameId, guess } = req.body;
    if (!gameId || !guess) {
      return res.status(400).json({ error: 'Missing gameId or guess' });
    }
    
    const sessionResult = await getDb().getGameSession(gameId);
    if (!sessionResult.success) {
      return res.status(500).json({ error: sessionResult.error?.message || 'Failed to get game session' });
    }
    if (!sessionResult.data) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const result = await getDb().processGuess(gameId, guess, sessionResult.data);
    if (!result.success) {
      return res.status(500).json({ error: result.error?.message || 'Failed to process guess' });
    }
    
    // Return only properties that exist in the GuessResult type
    res.json({
      guess: result.data.guess,
      isCorrect: result.data.isCorrect,
      gameOver: result.data.gameOver,
      correctWord: result.data.correctWord
    });
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

router.get('/hint/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { type } = req.query;
    
    const session = await getDb().getGameSession(gameId);
    if (!session) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const clue = await getDb().getClue(session, type as ClueType);
    res.json({ clue });
  } catch (error) {
    console.error('Error getting hint:', error);
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

router.get('/streak-status', async (req, res) => {
  try {
    const { playerId } = req.query;
    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }
    
    const stats = await getDb().getUserStats(playerId as string);
    res.json({
      currentStreak: stats?.current_streak || 0,
      longestStreak: stats?.longest_streak || 0
    });
  } catch (error) {
    console.error('Error getting streak status:', error);
    res.status(500).json({ error: 'Failed to get streak status' });
  }
});

router.post('/submit-score', async (req, res) => {
  try {
    const { playerId, won, guessesUsed, timeTaken } = req.body;
    if (!playerId || typeof won !== 'boolean' || typeof guessesUsed !== 'number' || typeof timeTaken !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await getDb().updateUserStats(playerId, won, guessesUsed, timeTaken);
    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

export default router; 