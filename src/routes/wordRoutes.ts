import { Router } from 'express';
import { getDb } from '../config/database/db';
import { ClueType } from '@shared/types';

const router = Router();

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
          E2: word.equivalents?.split(',').map(s => s.trim()) || []
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
    
    const session = await getDb().getGameSession(gameId);
    if (!session) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const result = await getDb().processGuess(gameId, guess, session);
    res.json({
      guess: result.guess,
      isFuzzy: result.isFuzzy,
      fuzzyPositions: result.fuzzyPositions,
      gameOver: result.gameOver,
      correctWord: result.correctWord
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