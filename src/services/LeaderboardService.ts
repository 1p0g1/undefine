import { getDb } from '../config/database/db.js';
import type { UserStats, Result, LeaderboardEntry } from '@undefine/shared-types';
import { unwrapResult, isError } from '@undefine/shared-types';

interface DailyLeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank: number;
  userStats?: UserStats;
}

export class LeaderboardService {
  static async getUserStats(username: string): Promise<Result<UserStats>> {
    try {
      const statsResult = await getDb().getUserStats(username);
      if (isError(statsResult)) {
        return {
          success: false,
          error: {
            code: 'USER_STATS_NOT_FOUND',
            message: statsResult.error.message || `User stats not found for username: ${username}`
          }
        };
      }
      if (!statsResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_STATS_NOT_FOUND',
            message: `User stats not found for username: ${username}`
          }
        };
      }
      return { success: true, data: statsResult.data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'USER_STATS_ERROR',
          message: 'Failed to retrieve user stats',
          details: error
        }
      };
    }
  }

  static async updateUserStats(
    username: string,
    won: boolean,
    guessesUsed: number,
    timeTaken: number
  ): Promise<Result<void>> {
    try {
      const result = await getDb().updateUserStats(username, won, guessesUsed, timeTaken);
      if (isError(result)) {
        return {
          success: false,
          error: {
            code: 'USER_STATS_UPDATE_ERROR',
            message: result.error.message || 'Failed to update user stats'
          }
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'USER_STATS_UPDATE_ERROR',
          message: 'Failed to update user stats',
          details: error
        }
      };
    }
  }

  static async getDailyLeaderboard(username?: string): Promise<Result<DailyLeaderboardResponse>> {
    try {
      const leaderboardResult = await getDb().getLeaderboard(10);
      if (isError(leaderboardResult)) {
        return {
          success: false,
          error: {
            code: 'LEADERBOARD_FETCH_ERROR',
            message: leaderboardResult.error.message || 'Failed to fetch leaderboard'
          }
        };
      }

      const entries = leaderboardResult.data || [];
      let userRank = 0;
      let userStats: UserStats | undefined;

      if (username) {
        const statsResult = await this.getUserStats(username);
        if (!isError(statsResult)) {
          userStats = statsResult.data;
        }
        // Calculate user rank if they're not in top 10
        if (!entries.some(entry => entry.username === username)) {
          const rankResult = await getDb().getLeaderboard();
          if (!isError(rankResult)) {
            const allEntries = rankResult.data || [];
            userRank = allEntries.findIndex(entry => entry.username === username) + 1;
          }
        }
      }

      return {
        success: true,
        data: {
          entries: entries.map((entry, index) => ({
            username: entry.username,
            score: entry.score || 0,
            rank: entry.rank || index + 1,
            wordId: entry.wordId,
            word: entry.word,
            timeTaken: entry.timeTaken,
            guessesUsed: entry.guessesUsed
          })),
          userRank,
          userStats
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LEADERBOARD_ERROR',
          message: 'Failed to retrieve leaderboard data',
          details: error
        }
      };
    }
  }
} 