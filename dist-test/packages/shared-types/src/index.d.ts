/**
 * Shared types for Un-Define game
 */
import { ClueType, GuessResult, WordData } from './types/core.js';
import { UserStats, GameSession, LeaderboardEntry, StreakLeader } from './types/app.js';
export type Result<T> = {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
};
export type { GameState, ClueType, ClueStatus, GuessResult, WordClues, WordData as Word, WordData, SafeClueData } from './types/core.js';
export type { HintIndex, Message, GuessHistory, AppGameState } from './utils/game.js';
export type { GameWord, UserStats, GameSession, LeaderboardEntry, StreakLeader, DailyMetrics } from './types/app.js';
export type { DBWord, DBUserStats, DBGameSession, DBLeaderboardEntry, DBStreakLeader, DBDailyMetrics } from './types/db.js';
export type User = {
    id: string;
    username: string;
    email?: string;
    created_at: string;
    last_login?: string;
};
export type FormState = {
    isValid: boolean;
    errors: string[];
};
export type WordEntry = {
    id: string;
    word: string;
    definition: string;
    etymology?: string;
    in_a_sentence?: string;
    first_letter?: string;
    number_of_letters?: number;
    equivalents?: string[];
    difficulty?: string;
    created_at?: string;
    updated_at?: string;
};
export interface DatabaseClient {
    connect(): Promise<Result<void>>;
    disconnect(): Promise<Result<void>>;
    getRandomWord(): Promise<Result<WordData>>;
    getDailyWord(): Promise<Result<WordData>>;
    processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<GuessResult>>;
    getUserStats(username: string): Promise<Result<UserStats | null>>;
    getLeaderboard(limit?: number): Promise<Result<LeaderboardEntry[]>>;
    getTopStreaks(limit?: number): Promise<Result<StreakLeader[]>>;
    submitScore(gameId: string, score: number): Promise<Result<void>>;
    getNextHint(gameId: string): Promise<Result<string>>;
    updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<Result<void>>;
    getGameSession(gameId: string): Promise<Result<GameSession>>;
    startGame(): Promise<Result<GameSession>>;
    endGame(gameId: string, won: boolean): Promise<Result<void>>;
    getClue(session: GameSession, clueType: ClueType): Promise<Result<string>>;
    getUserByUsername(username: string): Promise<Result<User | null>>;
    createUser(username: string): Promise<Result<User>>;
    addLeaderboardEntry(entry: LeaderboardEntry): Promise<Result<void>>;
    markAsUsed(wordId: string): Promise<Result<void>>;
}
export declare class ValidationError extends Error {
    constructor(message: string);
}
export { HINT_INDICES, INDEX_TO_HINT, clueTypeToNumber, numberToClueType, isHintAvailable, getHintContent } from './utils/game.js';
export { validateWordData, isWordData, validateClues, validateWordId, validateWordLength, validateFirstLetter, joinEquivalents, splitEquivalents, getSynonyms, normalizeEquivalents } from './utils/word.js';
export { mapDBWordToGameWord, mapDBUserStatsToUserStats, mapDBGameSessionToGameSession, mapDBLeaderboardEntryToLeaderboardEntry, mapDBStreakLeaderToStreakLeader, mapDBDailyMetricsToDailyMetrics } from './utils/mappers.js';
//# sourceMappingURL=index.d.ts.map