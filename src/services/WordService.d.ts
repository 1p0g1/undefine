import type { GuessResult, GameWord } from 'shared-types';
export declare class WordService {
    private static supabase;
    /**
     * Get a word by its ID
     */
    static getWord(wordId: string): Promise<GameWord | null>;
    /**
     * Get the daily word
     */
    static getDailyWord(): Promise<GameWord | null>;
    /**
     * Get a random word
     */
    static getRandomWord(): Promise<GameWord | null>;
    /**
     * Check if a guess matches a word
     */
    static checkGuess(gameId: string, guess: string): Promise<GuessResult>;
    /**
     * Add a new word
     */
    static addWord(wordData: Omit<GameWord, 'id'>): Promise<GameWord>;
    /**
     * Update an existing word
     */
    static updateWord(wordId: string, wordData: Partial<Omit<GameWord, 'id'>>): Promise<GameWord>;
    /**
     * Search for words
     */
    static searchWords(query: string): Promise<GameWord[]>;
    /**
     * Validate word data
     */
    private static validateWordData;
    /**
     * Map a Word to GameWord
     */
    private static mapToGameWord;
}
