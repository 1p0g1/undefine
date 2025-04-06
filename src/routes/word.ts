import { Router } from 'express';
import { WordService } from '../services/WordService.js';
import { authenticateUser } from '../auth/authMiddleware.js';

const router = Router();

// Get a random word
router.get('/random', async (req, res) => {
  try {
    const word = await WordService.getRandomWord();
    res.json(word);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get random word' });
  }
});

// Get today's word
router.get('/daily', async (req, res) => {
  try {
    const word = await WordService.getDailyWord();
    res.json(word);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get daily word' });
  }
});

// Admin routes
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const word = await WordService.addWord(req.body);
    res.json(word);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add word' });
  }
});

export { router as wordRouter }; 