import { Router } from 'express';
import { StatsService } from '../services/StatsService.js';
import { authenticateUser } from '../auth/authMiddleware.js';

const router = Router();

// Get daily stats
router.get('/daily', async (req, res) => {
  try {
    const stats = await StatsService.getDailyStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get daily stats' });
  }
});

// Get user stats
router.get('/user/:username', authenticateUser, async (req, res) => {
  try {
    const stats = await StatsService.getUserStats(req.params.username);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get top streaks
router.get('/streaks', async (req, res) => {
  try {
    const streaks = await StatsService.getTopStreaks();
    res.json(streaks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get top streaks' });
  }
});

export { router as statsRouter }; 