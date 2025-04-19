import type { UserStats } from 'shared-types';
export declare class LeaderboardService {
    static getUserStats(username: string): Promise<UserStats>;
    static updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
}
