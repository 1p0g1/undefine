import { Router } from 'express';
import { db } from '../config/database/db.ts';

const router = Router();

router.get('/word', async (req, res) => {
  try {
    console.log('Attempting to get a word...');
    const word = await db.getDailyWord();
    if (!word) {
      console.log('No word found in database');
      return res.status(404).json({ error: 'No words available' });
    }
    
    console.log('Word found:', { id: word.id, word: word.word });
    const gameSession = await db.startGame();
    res.json({ 
      gameId: gameSession.id,
      word: {
        definition: word.definition,
        // Only include the definition initially
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
    
    const session = await db.getGameSession(gameId);
    if (!session) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const result = await db.processGuess(gameId, guess, session);
    res.json(result);
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

export default router; 