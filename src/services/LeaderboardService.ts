import { getDb } from '../config/database/db.js';
import type { UserStats } from '@undefine/shared-types';

// Since these types are used in the interfaces but aren't defined in shared.ts
interface LeaderboardEntry {
  id: string;
  username: string;
  wordId: string;
  word: string;
  timeTaken: number;
  guessesUsed: number;
  fuzzyMatches: number;
  hintsUsed: number;
  createdAt: string;
}

interface DailyLeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank: number;
  userStats?: UserStats;
}

export class LeaderboardService {
  static async getUserStats(username: string): Promise<UserStats> {
    const stats = await getDb().getUserStats(username);
    if (!stats) {
      throw new Error(`User stats not found for username: ${username}`);
    }
    return stats;
  }

  static async updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void> {
    await getDb().updateUserStats(username, won, guessesUsed, timeTaken);
  }
} 