import { db } from '../config/database/db.js';
import type { DailyMetrics, UserStats, StreakLeader } from '@reversedefine/shared-types';
import type { DbUserStats } from '../config/database/types.js';

export class StatsService {
  static async getDailyStats(): Promise<DailyMetrics> {
    return await db.getTodayMetrics();
  }

  static async getUserStats(username: string): Promise<UserStats> {
    const stats = await db.getUserStats(username);
    if (!stats) {
      throw new Error('User stats not found');
    }
    return stats;
  }

  static async updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void> {
    await db.updateUserStats(username, won, guessesUsed, timeTaken);
  }

  static async getStreakLeaders(limit: number = 10): Promise<StreakLeader[]> {
    return await db.getTopStreaks(limit);
  }

  static async updateStreak(userId: string, newStreak: number): Promise<void> {
    await db.updateStreak(userId, newStreak);
  }

  static async resetStreak(userId: string): Promise<void> {
    await db.resetStreak(userId);
  }

  static async incrementGamesPlayed(userId: string): Promise<void> {
    await db.incrementGamesPlayed(userId);
  }

  static async incrementGamesWon(userId: string): Promise<void> {
    await db.incrementGamesWon(userId);
  }

  static async updateAverageGuesses(userId: string, newGuessCount: number): Promise<void> {
    await db.updateAverageGuesses(userId, newGuessCount);
  }

  static async updateBestTime(userId: string, newTime: number): Promise<void> {
    await db.updateBestTime(userId, newTime);
  }
} 