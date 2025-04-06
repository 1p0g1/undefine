import { Router } from 'express';
import { db } from '../config/database/db.js';
import { authenticateUser } from '../auth/authMiddleware.js';

const router = Router();

// Get daily leaderboard
router.get('/daily', async (req, res) => {
  try {
    const leaderboard = await db.getDailyLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get daily leaderboard' });
  }
});

// Get all-time leaderboard
router.get('/all-time', async (req, res) => {
  try {
    const leaderboard = await db.getAllTimeLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all-time leaderboard' });
  }
});

// Get user's rank
router.get('/rank/:username', authenticateUser, async (req, res) => {
  try {
    const rank = await db.getUserRank(req.params.username);
    res.json({ rank });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user rank' });
  }
});

export { router as leaderboardRouter }; 