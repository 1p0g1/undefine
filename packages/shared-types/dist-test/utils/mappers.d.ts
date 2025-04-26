import { DBWord, DBUserStats, DBGameSession, DBLeaderboardEntry, DBStreakLeader, DBDailyMetrics } from '../types/db.js';
import { GameWord, UserStats, GameSession, LeaderboardEntry, StreakLeader, DailyMetrics } from '../types/app.js';
/**
 * Safely maps a DBWord to a GameWord, ensuring equivalents is always a string[]
 * @param dbWord The database word object
 * @returns A GameWord with normalized equivalents property
 */
export declare function mapDBWordToGameWord(dbWord: DBWord): GameWord;
export declare function mapDBUserStatsToUserStats(dbStats: DBUserStats): UserStats;
export declare function mapDBGameSessionToGameSession(dbSession: DBGameSession): GameSession;
export declare function mapDBLeaderboardEntryToLeaderboardEntry(dbEntry: DBLeaderboardEntry): LeaderboardEntry;
export declare function mapDBStreakLeaderToStreakLeader(dbLeader: DBStreakLeader): StreakLeader;
export declare function mapDBDailyMetricsToDailyMetrics(dbMetrics: DBDailyMetrics): DailyMetrics;
//# sourceMappingURL=mappers.d.ts.map