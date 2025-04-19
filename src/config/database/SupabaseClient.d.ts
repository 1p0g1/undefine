import { GameSession, GuessResult, ClueType, DatabaseClient, Word, User, UserStats } from '../../types/shared.js';
export type { GameSession, GuessResult };
export declare class SupabaseClient implements DatabaseClient {
    private client;
    private static instance;
    private constructor();
    static getInstance(): SupabaseClient;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getRandomWord(): Promise<Word>;
    getDailyWord(): Promise<Word>;
    processGuess(gameId: string, guess: string, session: GameSession): Promise<GuessResult>;
    getUserStats(username: string): Promise<UserStats | null>;
    updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
    getGameSession(gameId: string): Promise<GameSession | null>;
    startGame(): Promise<GameSession>;
    getClue(session: GameSession, clueType: ClueType): Promise<string | number | null>;
    endGame(gameId: string, won: boolean): Promise<void>;
    getUserByUsername(username: string): Promise<User | null>;
    createUser(username: string): Promise<User>;
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
    checkGuess(wordId: string, guess: string): Promise<boolean>;
}
