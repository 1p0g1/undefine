import type { UserStats } from '../types/shared.js';
interface DailyMetrics {
    totalGames: number;
    averageTime: number;
    averageGuesses: number;
    uniquePlayers: number;
    completionRate: number;
}
export declare class StatsService {
    static getDailyStats(): Promise<DailyMetrics>;
    static getUserStats(username: string): Promise<UserStats>;
    static updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
    static getTopStreaks(limit?: number): Promise<any>;
}
export {};
