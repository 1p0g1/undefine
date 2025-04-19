import { DatabaseClient, Word, LeaderboardEntry, DailyLeaderboardResponse, UserStats } from './database/types.js';
export type { DatabaseClient, Word, LeaderboardEntry, DailyLeaderboardResponse, UserStats };
export declare function initializeDatabase(): Promise<void>;
export declare const redisClient: any;
export declare const CACHE_TTL: number;
export default initializeDatabase;
