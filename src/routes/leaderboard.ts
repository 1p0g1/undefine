import { Router } from 'express';
import { getDb } from '../config/database/db.js';
import { authenticateUser } from '../auth/authMiddleware.js';
import { UserStats } from '@undefine/shared-types';

const router = Router();

// Get daily leaderboard - returns top players for today
router.get('/daily', async (req, res) => {
  try {
    // Get all users with stats
    const allStats: UserStats[] = [];
    const users = await getDb().getUserByUsername('*');
    if (users) {
      for (const user of Array.isArray(users) ? users : [users]) {
        const stats = await getDb().getUserStats(user.username);
        if (stats) {
          const today = new Date();
          const statsDate = new Date(stats.last_played_at);
          if (statsDate.toDateString() === today.toDateString()) {
            allStats.push(stats);
          }
        }
      }
    }
    
    // Sort by wins and time
    const sortedStats = allStats
      .sort((a, b) => {
        if (b.games_won !== a.games_won) return b.games_won - a.games_won;
        return a.average_time - b.average_time;
      })
      .slice(0, 10); // Top 10 players
    
    res.json({ leaderboard: sortedStats });
  } catch (error) {
    console.error('Failed to get daily leaderboard:', error);
    res.status(500).json({ error: 'Failed to get daily leaderboard' });
  }
});

// Get all-time leaderboard - returns top players by total wins
router.get('/all-time', async (req, res) => {
  try {
    // Get all users with stats
    const allStats: UserStats[] = [];
    const users = await getDb().getUserByUsername('*');
    if (users) {
      for (const user of Array.isArray(users) ? users : [users]) {
        const stats = await getDb().getUserStats(user.username);
        if (stats) {
          allStats.push(stats);
        }
      }
    }
    
    // Sort by total wins and longest streak
    const sortedStats = allStats
      .sort((a, b) => {
        if (b.games_won !== a.games_won) return b.games_won - a.games_won;
        return b.longest_streak - a.longest_streak;
      })
      .slice(0, 10); // Top 10 players
    
    res.json({ leaderboard: sortedStats });
  } catch (error) {
    console.error('Failed to get all-time leaderboard:', error);
    res.status(500).json({ error: 'Failed to get all-time leaderboard' });
  }
});

// Get user's rank
router.get('/rank/:username', authenticateUser, async (req, res) => {
  try {
    const userStats = await getDb().getUserStats(req.params.username);
    if (!userStats) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all users with stats
    const allStats: UserStats[] = [];
    const users = await getDb().getUserByUsername('*');
    if (users) {
      for (const user of Array.isArray(users) ? users : [users]) {
        const stats = await getDb().getUserStats(user.username);
        if (stats) {
          allStats.push(stats);
        }
      }
    }
    
    // Sort by wins to find rank
    const sortedStats = allStats.sort((a, b) => b.games_won - a.games_won);
    const rank = sortedStats.findIndex(u => u.username === req.params.username) + 1;
    
    res.json({ rank, stats: userStats });
  } catch (error) {
    console.error('Failed to get user rank:', error);
    res.status(500).json({ error: 'Failed to get user rank' });
  }
});

export { router as leaderboardRouter }; 