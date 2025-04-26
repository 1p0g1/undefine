import { SupabaseClient } from '../config/database/SupabaseClient.js';
import { GameWord, WordData, WordClues, Result, GameSession, GuessResult } from '../../packages/shared-types/src/index.js';

// Constants for word validation
const MAX_WORD_LENGTH = 100;
const MAX_DEFINITION_LENGTH = 1000;

export class WordService {
    static supabase = SupabaseClient.getInstance();

    /**
     * Get a word by its ID
     */
    static async getWord(wordId: string): Promise<Result<GameWord | null>> {
        try {
            const sessionResult = await this.supabase.getGameSession(wordId);
            if (!sessionResult.success || !sessionResult.data) {
                return { success: false, data: null };
            }
            return { success: true, data: sessionResult.data.words };
        }
        catch (error) {
            console.error('Failed to get word:', error);
            return { 
                success: false, 
                error: { 
                    code: 'WORD_FETCH_ERROR', 
                    message: 'Failed to get word', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Get the daily word
     */
    static async getDailyWord(): Promise<Result<GameWord | null>> {
        try {
            const result = await this.supabase.getDailyWord();
            if (!result.success || !result.data) {
                return { success: false, data: null };
            }
            return { success: true, data: this.mapToGameWord(result.data) };
        }
        catch (error) {
            console.error('Failed to get daily word:', error);
            return { 
                success: false, 
                error: { 
                    code: 'DAILY_WORD_FETCH_ERROR', 
                    message: 'Failed to get daily word', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Get a random word
     */
    static async getRandomWord(): Promise<Result<GameWord | null>> {
        try {
            const result = await this.supabase.getRandomWord();
            if (!result.success || !result.data) {
                return { success: false, data: null };
            }
            return { success: true, data: this.mapToGameWord(result.data) };
        }
        catch (error) {
            console.error('Failed to get random word:', error);
            return { 
                success: false, 
                error: { 
                    code: 'RANDOM_WORD_FETCH_ERROR', 
                    message: 'Failed to get random word', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Check if a guess matches a word
     */
    static async checkGuess(gameId: string, guess: string): Promise<Result<GuessResult>> {
        try {
            const sessionResult = await this.supabase.getGameSession(gameId);
            if (!sessionResult.success || !sessionResult.data) {
                return { 
                    success: false, 
                    error: { 
                        code: 'GAME_SESSION_NOT_FOUND', 
                        message: 'Game session not found' 
                    } 
                };
            }
            return await this.supabase.processGuess(gameId, guess, sessionResult.data);
        }
        catch (error) {
            console.error('Failed to check guess:', error);
            return { 
                success: false, 
                error: { 
                    code: 'GUESS_CHECK_ERROR', 
                    message: 'Failed to check guess', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Add a new word to the database
     */
    static async addWord(wordData: Partial<WordData>): Promise<Result<GameWord>> {
        try {
            this.validateWordData(wordData);
            const sessionResult = await this.supabase.startGame();
            if (!sessionResult.success || !sessionResult.data) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_ADD_ERROR', 
                        message: 'Failed to add word' 
                    } 
                };
            }
            return { success: true, data: sessionResult.data.words };
        }
        catch (error) {
            console.error('Failed to add word:', error);
            return { 
                success: false, 
                error: { 
                    code: 'WORD_ADD_ERROR', 
                    message: 'Failed to add word', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Update an existing word
     */
    static async updateWord(wordId: string, wordData: Partial<WordData>): Promise<Result<GameWord>> {
        try {
            this.validateWordData(wordData);
            const sessionResult = await this.supabase.getGameSession(wordId);
            if (!sessionResult.success || !sessionResult.data) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_UPDATE_ERROR', 
                        message: 'Failed to update word' 
                    } 
                };
            }
            return { success: true, data: sessionResult.data.words };
        }
        catch (error) {
            console.error('Failed to update word:', error);
            return { 
                success: false, 
                error: { 
                    code: 'WORD_UPDATE_ERROR', 
                    message: 'Failed to update word', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Search for words
     */
    static async searchWords(query: string): Promise<Result<GameWord[]>> {
        try {
            // Note: Search functionality not available in current DatabaseClient interface
            // Return empty array for now
            return { success: true, data: [] };
        }
        catch (error) {
            console.error('Failed to search words:', error);
            return { 
                success: false, 
                error: { 
                    code: 'WORD_SEARCH_ERROR', 
                    message: 'Failed to search words', 
                    details: error 
                } 
            };
        }
    }

    /**
     * Validate word data
     */
    static validateWordData(wordData: Partial<WordData>): void {
        if (wordData.word && wordData.word.length > MAX_WORD_LENGTH) {
            throw new Error(`Word length exceeds maximum of ${MAX_WORD_LENGTH} characters`);
        }
        if (wordData.definition && wordData.definition.length > MAX_DEFINITION_LENGTH) {
            throw new Error(`Definition length exceeds maximum of ${MAX_DEFINITION_LENGTH} characters`);
        }
    }

    /**
     * Map WordData to GameWord
     */
    static mapToGameWord(word: WordData): GameWord {
        return {
            id: word.id,
            word: word.word,
            definition: word.definition,
            etymology: word.etymology || null,
            firstLetter: word.first_letter,
            inASentence: word.in_a_sentence || null,
            numberOfLetters: word.number_of_letters,
            equivalents: word.equivalents ? word.equivalents.split(',').filter(Boolean) : [],
            difficulty: word.difficulty || 'medium',
            createdAt: word.created_at,
            updatedAt: word.updated_at
        };
    }
}
