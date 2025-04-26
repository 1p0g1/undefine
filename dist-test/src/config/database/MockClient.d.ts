import { DatabaseClient, GameSession, GuessResult, UserStats, WordData, Result, LeaderboardEntry as SharedLeaderboardEntry, StreakLeader as SharedStreakLeader } from '../../../packages/shared-types/src/index.js';
/**
 * MockClient - A database client that returns pre-defined responses
 * for testing and development purposes.
 */
export declare class MockClient implements DatabaseClient {
    private connected;
    private words;
    private gameSessions;
    private leaderboard;
    private dailyMetrics;
    private streakLeaders;
    private users;
    constructor();
    connect(): Promise<Result<void>>;
    disconnect(): Promise<Result<void>>;
    getRandomWord(): Promise<Result<WordData>>;
    getDailyWord(): Promise<Result<WordData>>;
    processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<GuessResult>>;
    getLeaderboard(limit?: number): Promise<Result<SharedLeaderboardEntry[]>>;
    getTopStreaks(limit?: number): Promise<Result<SharedStreakLeader[]>>;
    getNextHint(gameId: string): Promise<Result<string>>;
    submitScore(gameId: string, score: number): Promise<Result<void>>;
    createGameSession(wordId: string, word: string): Promise<GameSession>;
    getUserStats(username: string): Promise<Result<UserStats | null>>;
}
//# sourceMappingURL=MockClient.d.ts.map