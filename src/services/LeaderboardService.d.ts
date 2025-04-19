import type { UserStats } from '../types/shared.js';
export declare class LeaderboardService {
    static getUserStats(username: string): Promise<UserStats>;
    static updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
}
