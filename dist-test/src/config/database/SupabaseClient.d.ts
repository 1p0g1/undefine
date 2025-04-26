import { ClueType, DatabaseClient, GameSession, GuessResult, User, UserStats, WordData, Result, LeaderboardEntry, StreakLeader } from '../../../packages/shared-types/src/index.js';
export declare class SupabaseClient implements DatabaseClient {
    private client;
    private static instance;
    constructor(supabaseUrl: string, supabaseKey: string);
    static getInstance(): SupabaseClient;
    connect(): Promise<Result<void>>;
    disconnect(): Promise<Result<void>>;
    getRandomWord(): Promise<Result<WordData>>;
    getDailyWord(): Promise<Result<WordData>>;
    processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<GuessResult>>;
    getUserStats(username: string): Promise<Result<UserStats | null>>;
    updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<Result<void>>;
    getGameSession(gameId: string): Promise<Result<GameSession>>;
    startGame(): Promise<Result<GameSession>>;
    getClue(session: GameSession, clueType: ClueType): Promise<Result<string>>;
    endGame(gameId: string, won: boolean): Promise<Result<void>>;
    getUserByUsername(username: string): Promise<Result<User | null>>;
    createUser(username: string): Promise<Result<User>>;
    getNextHint(gameId: string): Promise<Result<string>>;
    submitScore(gameId: string, score: number): Promise<Result<void>>;
    checkGuess(wordId: string, guess: string): Promise<boolean>;
    getLeaderboard(limit?: number): Promise<Result<LeaderboardEntry[]>>;
    getTopStreaks(limit?: number): Promise<Result<StreakLeader[]>>;
    addLeaderboardEntry(entry: LeaderboardEntry): Promise<Result<void>>;
    markAsUsed(wordId: string): Promise<Result<void>>;
    /**
     * Search for words using case-insensitive matching
     * @param query The search query (minimum 2 characters)
     * @returns A list of matching words
     */
    searchWords(query: string): Promise<Result<WordData[]>>;
}
//# sourceMappingURL=SupabaseClient.d.ts.map