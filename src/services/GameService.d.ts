import type { Word } from '../types/shared.js';
export interface GameState {
    word: Word;
    startTime: Date;
    guessCount: number;
    fuzzyCount: number;
    hintCount: number;
    hints: {
        D: boolean;
        E: boolean;
        F: boolean;
        I: boolean;
        N: boolean;
        E2: boolean;
    };
}
export interface GuessResult {
    isCorrect: boolean;
    guess: string;
    isFuzzy: boolean;
    fuzzyPositions: number[];
    gameOver: boolean;
    correctWord?: string;
}
export interface GameResponse {
    gameId: string;
    word: {
        word: string;
        definition: string;
        letterCount: {
            count: number;
            display: string;
        };
    };
}
export declare class GameService {
    static activeGames: Map<string, GameState>;
    static getRandomWord(): Promise<Word>;
    static startGame(): Promise<GameResponse>;
    static processGuess(gameId: string, guess: string): Promise<GuessResult>;
    private static isFuzzyMatch;
    private static getFuzzyPositions;
    static cleanupOldGames(): void;
    /**
     * Fetches the word of the day and immediately marks it as used
     * This is typically used for the daily word challenge feature
     * @returns The word of the day with its definition and part of speech
     */
    static getTodayWord(date?: string): Promise<Word>;
}
