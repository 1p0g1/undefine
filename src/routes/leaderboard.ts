import { Router } from 'express';
import { getDb } from '../config/database/db.js';
import { authenticateUser } from '../auth/authMiddleware.js';
import { UserStats, unwrapResult, isError } from '@undefine/shared-types';

const router = Router();

// Get daily leaderboard - returns top players for today
router.get('/daily', async (req, res) => {
  try {
    // Get all users with stats
    const allStats: UserStats[] = [];
    const usersResult = await getDb().getUserByUsername('*');
    if (isError(usersResult)) {
      return res.status(500).json({ error: usersResult.error.message || 'Failed to get users' });
    }
    
    const users = usersResult.data;
    if (users) {
      for (const user of Array.isArray(users) ? users : [users]) {
        const statsResult = await getDb().getUserStats(user.username);
        if (isError(statsResult)) {
          console.error(`Error getting stats for user ${user.username}:`, statsResult.error.message);
          continue;
        }
        
        const stats = statsResult.data;
        if (stats) {
          const today = new Date();
          const statsDate = new Date(stats.lastPlayedAt);
          if (statsDate.toDateString() === today.toDateString()) {
            allStats.push(stats);
          }
        }
      }
    }
    
    // Sort by wins and time
    const sortedStats = allStats
      .sort((a, b) => {
        if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
        return a.averageTime - b.averageTime;
      })
      .slice(0, 10); // Top 10 players
    
    res.json({ leaderboard: sortedStats });
  } catch (error) {
    console.error('Failed to get daily leaderboard:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get daily leaderboard' });
  }
});

// Get all-time leaderboard - returns top players by total wins
router.get('/all-time', async (req, res) => {
  try {
    // Get all users with stats
    const allStats: UserStats[] = [];
    const usersResult = await getDb().getUserByUsername('*');
    if (isError(usersResult)) {
      return res.status(500).json({ error: usersResult.error.message || 'Failed to get users' });
    }
    
    const users = usersResult.data;
    if (users) {
      for (const user of Array.isArray(users) ? users : [users]) {
        const statsResult = await getDb().getUserStats(user.username);
        if (isError(statsResult)) {
          console.error(`Error getting stats for user ${user.username}:`, statsResult.error.message);
          continue;
        }
        
        const stats = statsResult.data;
        if (stats) {
          allStats.push(stats);
        }
      }
    }
    
    // Sort by total wins and longest streak
    const sortedStats = allStats
      .sort((a, b) => {
        if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
        return b.longestStreak - a.longestStreak;
      })
      .slice(0, 10); // Top 10 players
    
    res.json({ leaderboard: sortedStats });
  } catch (error) {
    console.error('Failed to get all-time leaderboard:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get all-time leaderboard' });
  }
});

// Get user's rank
router.get('/rank/:username', authenticateUser, async (req, res) => {
  try {
    const userStatsResult = await getDb().getUserStats(req.params.username);
    if (isError(userStatsResult)) {
      return res.status(404).json({ error: userStatsResult.error.message || 'User not found' });
    }
    
    const userStats = userStatsResult.data;
    if (!userStats) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all users with stats
    const allStats: UserStats[] = [];
    const usersResult = await getDb().getUserByUsername('*');
    if (isError(usersResult)) {
      return res.status(500).json({ error: usersResult.error.message || 'Failed to get users' });
    }
    
    const users = usersResult.data;
    if (users) {
      for (const user of Array.isArray(users) ? users : [users]) {
        const statsResult = await getDb().getUserStats(user.username);
        if (isError(statsResult)) {
          console.error(`Error getting stats for user ${user.username}:`, statsResult.error.message);
          continue;
        }
        
        const stats = statsResult.data;
        if (stats) {
          allStats.push(stats);
        }
      }
    }
    
    // Sort by wins to find rank
    const sortedStats = allStats.sort((a, b) => b.gamesWon - a.gamesWon);
    const rank = sortedStats.findIndex(u => u.username === req.params.username) + 1;
    
    res.json({ rank, stats: userStats });
  } catch (error) {
    console.error('Failed to get user rank:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get user rank' });
  }
});

export { router as leaderboardRouter }; 