import { SupabaseClient } from '../config/database/SupabaseClient.js';
import { GameWord, WordData, Result, GuessResult } from '../../packages/shared-types/src/index.js';
export declare class WordService {
    static supabase: SupabaseClient;
    /**
     * Get a word by its ID
     */
    static getWord(wordId: string): Promise<Result<GameWord | null>>;
    /**
     * Get the daily word
     */
    static getDailyWord(): Promise<Result<GameWord | null>>;
    /**
     * Get a random word
     */
    static getRandomWord(): Promise<Result<GameWord | null>>;
    /**
     * Check if a guess matches a word
     */
    static checkGuess(gameId: string, guess: string): Promise<Result<GuessResult>>;
    /**
     * Add a new word to the database
     */
    static addWord(wordData: Partial<WordData>): Promise<Result<GameWord>>;
    /**
     * Update an existing word
     */
    static updateWord(wordId: string, wordData: Partial<WordData>): Promise<Result<GameWord>>;
    /**
     * Search for words
     */
    static searchWords(query: string): Promise<Result<GameWord[]>>;
    /**
     * Validate word data
     */
    static validateWordData(wordData: Partial<WordData>): void;
    /**
     * Map WordData to GameWord
     */
    static mapToGameWord(word: WordData): GameWord;
}
//# sourceMappingURL=WordService.d.ts.map