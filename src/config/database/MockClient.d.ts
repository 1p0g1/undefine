import { ClueType, DatabaseClient, GameSession, GuessResult, User, UserStats, Word } from '../../types/shared.js';
interface DailyMetrics {
    totalGames: number;
    averageTime: number;
    averageGuesses: number;
    uniquePlayers: number;
    completionRate: number;
}
interface LeaderboardEntry {
    id: string;
    username: string;
    wordId: string;
    word: string;
    timeTaken: number;
    guessesUsed: number;
    fuzzyMatches: number;
    hintsUsed: number;
    createdAt: string;
}
interface StreakLeader {
    username: string;
    streak: number;
    lastPlayedAt: string;
}
interface DailyLeaderboardResponse {
    entries: LeaderboardEntry[];
    userRank: number;
}
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
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    initializeDatabase(): Promise<void>;
    setupTables(): Promise<void>;
    getWords(): Promise<Word[]>;
    getWord(wordId: string): Promise<Word | null>;
    addWord(word: Omit<Word, 'id'>): Promise<Word>;
    updateWord(wordId: string, word: Partial<Word>): Promise<Word>;
    deleteWord(wordId: string): Promise<boolean>;
    searchWords(query: string): Promise<Word[]>;
    getRandomWord(): Promise<Word>;
    getDailyWord(date?: string): Promise<Word>;
    setDailyWord(wordId: string, date: string): Promise<void>;
    getNextUnusedWord(): Promise<Word | null>;
    markAsUsed(wordId: string): Promise<void>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    createUser(username: string): Promise<User>;
    addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<LeaderboardEntry>;
    getDailyLeaderboard(): Promise<DailyLeaderboardResponse>;
    getLeaderboardRank(gameId: string): Promise<number | null>;
    getUserStats(username: string): Promise<UserStats | null>;
    updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
    getDailyStats(): Promise<DailyMetrics>;
    getTodayMetrics(): Promise<DailyMetrics>;
    getTopStreaks(): Promise<StreakLeader[]>;
    updateLastLogin(username: string): Promise<void>;
    private normalize;
    processGuess(gameId: string, guess: string, session: GameSession): Promise<GuessResult>;
    startGame(): Promise<GameSession>;
    getGameSession(gameId: string): Promise<GameSession | null>;
    checkGuess(wordId: string, guess: string): Promise<boolean>;
    createGameSession(wordId: string, word: string): Promise<GameSession>;
    endGame(gameId: string, won: boolean): Promise<void>;
    getClue(session: GameSession, clueType: ClueType): Promise<string | number | null>;
    getNextHint(session: GameSession): Promise<{
        hint: string;
        type: ClueType;
    }>;
    submitScore(score: {
        playerId: string;
        word: string;
        guessesUsed: number;
        usedHint: boolean;
        completionTime: number;
        nickname?: string;
    }): Promise<void>;
}
export {};
