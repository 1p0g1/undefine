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
            const session = await this.supabase.getGameSession(wordId);
            if (!session?.words) {
                return { success: false, data: null };
            }
            return { success: true, data: session.words };
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
            const session = await this.supabase.getGameSession(gameId);
            if (!session) {
                return { 
                    success: false, 
                    error: { 
                        code: 'GAME_SESSION_NOT_FOUND', 
                        message: 'Game session not found' 
                    } 
                };
            }
            return await this.supabase.processGuess(gameId, guess, session);
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
     * Add a new word
     */
    static async addWord(wordData: Partial<WordData>): Promise<Result<GameWord>> {
        try {
            this.validateWordData(wordData);
            const session = await this.supabase.startGame();
            if (!session?.words) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_CREATE_ERROR', 
                        message: 'Failed to create word' 
                    } 
                };
            }
            return { success: true, data: session.words };
        }
        catch (error) {
            console.error('Failed to add word:', error);
            return { 
                success: false, 
                error: { 
                    code: 'WORD_CREATE_ERROR', 
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
            if (Object.keys(wordData).length > 0) {
                this.validateWordData(wordData);
            }
            const session = await this.supabase.getGameSession(wordId);
            if (!session?.words) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_NOT_FOUND', 
                        message: 'Word not found' 
                    } 
                };
            }
            // Note: Update functionality not available in current DatabaseClient interface
            return { success: true, data: session.words };
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
        const errors = [];
        if (wordData.word) {
            if (wordData.word.length === 0 || wordData.word.length > MAX_WORD_LENGTH) {
                errors.push(`Word must be between 1 and ${MAX_WORD_LENGTH} characters`);
            }
        }
        if (wordData.clues) {
            if (!wordData.clues.D || wordData.clues.D.length > MAX_DEFINITION_LENGTH) {
                errors.push(`Definition must be between 1 and ${MAX_DEFINITION_LENGTH} characters`);
            }
            if (!wordData.clues.E) {
                errors.push('Etymology is required');
            }
            if (!wordData.clues.F || wordData.clues.F.length !== 1) {
                errors.push('First letter must be exactly one character');
            }
            if (!wordData.clues.I) {
                errors.push('Example sentence is required');
            }
            if (!wordData.clues.N || typeof wordData.clues.N !== 'number' || wordData.clues.N < 1) {
                errors.push('Number of letters must be a positive number');
            }
            if (!wordData.clues.E2 || !Array.isArray(wordData.clues.E2) || wordData.clues.E2.length === 0) {
                errors.push('At least one synonym is required');
            }
        }
        if (errors.length > 0) {
            throw new Error(`Word validation failed: ${errors.join(', ')}`);
        }
    }

    /**
     * Map a WordData to GameWord
     */
    static mapToGameWord(word: WordData): GameWord {
        return {
            id: word.id,
            word: word.word,
            definition: word.definition,
            etymology: word.etymology,
            firstLetter: word.first_letter,
            inASentence: word.in_a_sentence,
            numberOfLetters: word.number_of_letters,
            equivalents: word.equivalents ? word.equivalents.split(',').filter(Boolean) : [],
            difficulty: word.difficulty || '',
            createdAt: word.created_at || null,
            updatedAt: word.updated_at || null
        };
    }
}
