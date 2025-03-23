import { db } from '../config/database/index.js';
import { LeaderboardEntry, UserStats, DailyLeaderboardResponse } from '../config/database/index.js';

export class LeaderboardService {
  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return await db.getLeaderboard();
  }

  static async getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse> {
    return await db.getDailyLeaderboard(userEmail);
  }

  static async getUserStats(username: string): Promise<UserStats> {
    await db.updateUserStats(username);
    const response = await db.getDailyLeaderboard(username);
    return response.userStats!;
  }
} 