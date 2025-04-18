import { Router } from 'express';
import { GameService } from '../services/GameService.js';
import { authenticateUser, AuthRequest } from '../auth/authMiddleware.js';
import { Response } from 'express';

const router = Router();

// Start a new game
router.post('/start', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const game = await GameService.startGame();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Process a guess
router.post('/guess', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId, guess } = req.body;
    const result = await GameService.processGuess(gameId, guess);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

export { router as gameRouter }; 