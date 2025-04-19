import { getDb } from '../config/database/db.js';
export class LeaderboardService {
    static async getUserStats(username) {
        const stats = await getDb().getUserStats(username);
        if (!stats) {
            throw new Error(`User stats not found for username: ${username}`);
        }
        return stats;
    }
    static async updateUserStats(username, won, guessesUsed, timeTaken) {
        await getDb().updateUserStats(username, won, guessesUsed, timeTaken);
    }
}
