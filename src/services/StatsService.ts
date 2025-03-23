import { db } from '../config/database/index.js';
import { DailyMetrics, StreakLeader, DailyStatsResponse } from '../config/database/index.js';

export class StatsService {
  static async getDailyStats(): Promise<DailyStatsResponse> {
    return await db.getDailyStats();
  }

  static async getTodayMetrics(): Promise<DailyMetrics> {
    return await db.getTodayMetrics();
  }

  static async getTopStreaks(limit: number = 10): Promise<StreakLeader[]> {
    return await db.getTopStreaks(limit);
  }
} 