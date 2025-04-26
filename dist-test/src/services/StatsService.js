import { getDb } from '../config/database/db.js';
export class StatsService {
    static async getDailyStats() {
        // Fallback implementation if the database client doesn't support getDailyStats
        const mockStats = {
            totalGames: 0,
            averageTime: 0,
            averageGuesses: 0,
            uniquePlayers: 0,
            completionRate: 0
        };
        try {
            // @ts-ignore - Some implementations might have this method
            return await getDb().getDailyStats();
        }
        catch (error) {
            console.warn('getDailyStats not implemented in the current database client');
            return mockStats;
        }
    }
    static async getUserStats(username) {
        const stats = await getDb().getUserStats(username);
        if (!stats) {
            throw new Error('User stats not found');
        }
        return stats;
    }
    static async updateUserStats(username, won, guessesUsed, timeTaken) {
        await getDb().updateUserStats(username, won, guessesUsed, timeTaken);
    }
    static async getTopStreaks(limit = 10) {
        try {
            // @ts-ignore - Some implementations might have this method
            return await getDb().getTopStreaks();
        }
        catch (error) {
            console.warn('getTopStreaks not implemented in the current database client');
            return [];
        }
    }
}
//# sourceMappingURL=StatsService.js.map