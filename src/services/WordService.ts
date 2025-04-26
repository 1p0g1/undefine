import { SupabaseClient } from '../config/database/SupabaseClient.js';
import { GameWord, WordData, WordClues, Result, GameSession, GuessResult, unwrapResult, isError, mapDBWordToGameWord, normalizeEquivalents } from '@undefine/shared-types';

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
            if (isError(sessionResult)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'GAME_SESSION_NOT_FOUND', 
                        message: sessionResult.error.message || 'Game session not found' 
                    } 
                };
            }
            if (!sessionResult.data) {
                return { success: true, data: null };
            }
            return { success: true, data: sessionResult.data.words };
        }
        catch (error) {
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
            if (isError(result)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'DAILY_WORD_FETCH_ERROR', 
                        message: result.error.message || 'Failed to get daily word' 
                    } 
                };
            }
            if (!result.data) {
                return { success: true, data: null };
            }
            return { 
                success: true, 
                data: {
                    id: result.data.id,
                    word: result.data.word,
                    definition: result.data.definition,
                    etymology: result.data.etymology,
                    firstLetter: result.data.first_letter,
                    inASentence: result.data.in_a_sentence,
                    numberOfLetters: result.data.number_of_letters,
                    equivalents: normalizeEquivalents(result.data.equivalents),
                    difficulty: result.data.difficulty || 'medium',
                    createdAt: result.data.created_at,
                    updatedAt: result.data.updated_at
                }
            };
        }
        catch (error) {
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
            if (isError(result)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'RANDOM_WORD_FETCH_ERROR', 
                        message: result.error.message || 'Failed to get random word' 
                    } 
                };
            }
            if (!result.data) {
                return { success: true, data: null };
            }
            return { 
                success: true, 
                data: {
                    id: result.data.id,
                    word: result.data.word,
                    definition: result.data.definition,
                    etymology: result.data.etymology,
                    firstLetter: result.data.first_letter,
                    inASentence: result.data.in_a_sentence,
                    numberOfLetters: result.data.number_of_letters,
                    equivalents: normalizeEquivalents(result.data.equivalents),
                    difficulty: result.data.difficulty || 'medium',
                    createdAt: result.data.created_at,
                    updatedAt: result.data.updated_at
                }
            };
        }
        catch (error) {
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
            if (isError(sessionResult)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'GAME_SESSION_NOT_FOUND', 
                        message: sessionResult.error.message || 'Game session not found' 
                    } 
                };
            }
            if (!sessionResult.data) {
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
            if (isError(sessionResult)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_ADD_ERROR', 
                        message: sessionResult.error.message || 'Failed to add word' 
                    } 
                };
            }
            if (!sessionResult.data) {
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
            if (isError(sessionResult)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_UPDATE_ERROR', 
                        message: sessionResult.error.message || 'Failed to update word' 
                    } 
                };
            }
            if (!sessionResult.data) {
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
            const result = await this.supabase.searchWords(query);
            if (isError(result)) {
                return { 
                    success: false, 
                    error: { 
                        code: 'WORD_SEARCH_ERROR', 
                        message: result.error.message || 'Failed to search words' 
                    } 
                };
            }
            return { 
                success: true, 
                data: result.data ? result.data.map(word => ({
                    id: word.id,
                    word: word.word,
                    definition: word.definition,
                    etymology: word.etymology,
                    firstLetter: word.first_letter,
                    inASentence: word.in_a_sentence,
                    numberOfLetters: word.number_of_letters,
                    equivalents: normalizeEquivalents(word.equivalents),
                    difficulty: word.difficulty || 'medium',
                    createdAt: word.created_at,
                    updatedAt: word.updated_at
                })) : []
            };
        }
        catch (error) {
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
    private static validateWordData(wordData: Partial<WordData>): void {
        if (wordData.word && wordData.word.length > MAX_WORD_LENGTH) {
            throw new Error(`Word length exceeds maximum of ${MAX_WORD_LENGTH} characters`);
        }
        if (wordData.definition && wordData.definition.length > MAX_DEFINITION_LENGTH) {
            throw new Error(`Definition length exceeds maximum of ${MAX_DEFINITION_LENGTH} characters`);
        }
    }
}
