import { getDb } from '../config/database/db.js';
import type { UserStats } from 'shared-types';

// Define the interface for the daily metrics response
interface DailyMetrics {
  totalGames: number;
  averageTime: number;
  averageGuesses: number;
  uniquePlayers: number;
  completionRate: number;
}

export class StatsService {
  static async getDailyStats(): Promise<DailyMetrics> {
    // Fallback implementation if the database client doesn't support getDailyStats
    const mockStats: DailyMetrics = {
      totalGames: 0,
      averageTime: 0,
      averageGuesses: 0,
      uniquePlayers: 0,
      completionRate: 0
    };
    
    try {
      // @ts-ignore - Some implementations might have this method
      return await getDb().getDailyStats();
    } catch (error) {
      console.warn('getDailyStats not implemented in the current database client');
      return mockStats;
    }
  }

  static async getUserStats(username: string): Promise<UserStats> {
    const stats = await getDb().getUserStats(username);
    if (!stats) {
      throw new Error('User stats not found');
    }
    return stats;
  }

  static async updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void> {
    await getDb().updateUserStats(username, won, guessesUsed, timeTaken);
  }

  static async getTopStreaks(limit: number = 10) {
    try {
      // @ts-ignore - Some implementations might have this method
      return await getDb().getTopStreaks();
    } catch (error) {
      console.warn('getTopStreaks not implemented in the current database client');
      return [];
    }
  }
} 