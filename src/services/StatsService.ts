import { getDb } from '../config/database/db.js';
import type { UserStats, Result, DailyMetrics } from '@undefine/shared-types';
import { unwrapResult, isError } from '@undefine/shared-types';

export class StatsService {
  static async getDailyStats(): Promise<Result<DailyMetrics>> {
    try {
      // Since getDailyStats is not in the DatabaseClient interface,
      // we'll return a default response
      return {
        success: true,
        data: {
          date: new Date().toISOString().split('T')[0],
          totalGames: 0,
          totalWins: 0,
          averageGuesses: 0,
          averageTime: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DAILY_STATS_ERROR',
          message: 'Failed to retrieve daily stats',
          details: error
        }
      };
    }
  }

  static async getUserStats(username: string): Promise<Result<UserStats>> {
    try {
      const result = await getDb().getUserStats(username);
      if (isError(result)) {
        return {
          success: false,
          error: {
            code: 'USER_STATS_ERROR',
            message: result.error.message || `Failed to fetch stats for user: ${username}`
          }
        };
      }
      if (!result.data) {
        return {
          success: false,
          error: {
            code: 'USER_STATS_NOT_FOUND',
            message: `User stats not found for username: ${username}`
          }
        };
      }
      return { success: true, data: result.data };
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

  static async getTopStreaks(limit: number = 10): Promise<Result<Array<{ username: string; streak: number }>>> {
    try {
      const result = await getDb().getTopStreaks(limit);
      if (isError(result)) {
        return {
          success: false,
          error: {
            code: 'TOP_STREAKS_ERROR',
            message: result.error.message || 'Failed to fetch top streaks'
          }
        };
      }
      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TOP_STREAKS_ERROR',
          message: 'Failed to retrieve top streaks',
          details: error
        }
      };
    }
  }
} 