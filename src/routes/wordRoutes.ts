import { Router } from 'express';
import { db } from '../config/database/db.js';

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
        id: word.id,
        word: word.word,
        definition: word.definition,
        etymology: word.etymology,
        first_letter: word.first_letter,
        in_a_sentence: word.in_a_sentence,
        number_of_letters: word.number_of_letters,
        equivalents: word.equivalents,
        difficulty: word.difficulty
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
    res.json({
      isCorrect: result.isCorrect,
      correctWord: result.correctWord,
      guessedWord: guess,
      isFuzzy: result.isFuzzy || false,
      fuzzyPositions: result.fuzzyPositions || [],
      leaderboardRank: result.leaderboardRank
    });
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

router.get('/hint/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const session = await db.getGameSession(gameId);
    if (!session) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const nextHint = await db.getNextHint(session);
    res.json(nextHint);
  } catch (error) {
    console.error('Error getting hint:', error);
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

router.get('/streak-status', async (req, res) => {
  try {
    const playerId = req.headers['x-player-id'] as string;
    if (!playerId) {
      return res.status(400).json({ error: 'Missing player ID' });
    }
    
    const stats = await db.getUserStats(playerId);
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
    const { playerId, word, guessesUsed, usedHints, completionTime, nickname } = req.body;
    
    if (!playerId || !word || typeof guessesUsed !== 'number' || typeof completionTime !== 'number') {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await db.submitScore({
      playerId,
      word,
      guessesUsed,
      usedHint: usedHints > 0,
      completionTime,
      nickname
    });
    
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
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