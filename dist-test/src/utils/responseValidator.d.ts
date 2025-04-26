import { UserStats, GameSession, WordEntry, DailyMetrics, LeaderboardEntry, StreakLeader } from '@undefine/shared-types';
export declare const isWord: (data: unknown) => data is WordEntry;
export declare const isUserStats: (data: unknown) => data is UserStats;
export declare const isDailyMetrics: (data: unknown) => data is DailyMetrics;
export declare const isLeaderboardEntry: (data: unknown) => data is LeaderboardEntry;
export declare const isStreakLeader: (data: unknown) => data is StreakLeader;
export declare const isGameSession: (data: unknown) => data is GameSession;
export declare const validateWord: (data: unknown) => WordEntry;
export declare const validateUserStats: (data: unknown) => UserStats;
export declare const validateDailyMetrics: (data: unknown) => DailyMetrics;
export declare const validateLeaderboardEntry: (data: unknown) => LeaderboardEntry;
export declare const validateStreakLeader: (data: unknown) => StreakLeader;
export declare const validateGameSession: (data: unknown) => GameSession;
//# sourceMappingURL=responseValidator.d.ts.map