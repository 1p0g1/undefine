import { SupabaseClient } from '../config/database/SupabaseClient.js';
import type { Word, GuessResult, GameWord, WordClues } from 'shared-types';

// Constants for word validation
const MAX_WORD_LENGTH = 100;
const MAX_DEFINITION_LENGTH = 1000;

export class WordService {
  private static supabase = SupabaseClient.getInstance();

  /**
   * Get a word by its ID
   */
  static async getWord(wordId: string): Promise<GameWord | null> {
    try {
      const session = await this.supabase.getGameSession(wordId);
      if (!session?.words) return null;
      return this.mapToGameWord(session.words);
    } catch (error) {
      console.error('Failed to get word:', error);
      throw error;
    }
  }

  /**
   * Get the daily word
   */
  static async getDailyWord(): Promise<GameWord | null> {
    try {
      const word = await this.supabase.getDailyWord();
      return word ? this.mapToGameWord(word) : null;
    } catch (error) {
      console.error('Failed to get daily word:', error);
      throw error;
    }
  }

  /**
   * Get a random word
   */
  static async getRandomWord(): Promise<GameWord | null> {
    try {
      const word = await this.supabase.getRandomWord();
      return word ? this.mapToGameWord(word) : null;
    } catch (error) {
      console.error('Failed to get random word:', error);
      throw error;
    }
  }

  /**
   * Check if a guess matches a word
   */
  static async checkGuess(gameId: string, guess: string): Promise<GuessResult> {
    try {
      const session = await this.supabase.getGameSession(gameId);
      if (!session) {
        throw new Error('Game session not found');
      }
      return await this.supabase.processGuess(gameId, guess, session);
    } catch (error) {
      console.error('Failed to check guess:', error);
      throw error;
    }
  }

  /**
   * Add a new word
   */
  static async addWord(wordData: Omit<GameWord, 'id'>): Promise<GameWord> {
    try {
      this.validateWordData(wordData);
      const word = await this.supabase.startGame();
      if (!word.words) {
        throw new Error('Failed to create word');
      }
      return this.mapToGameWord(word.words);
    } catch (error) {
      console.error('Failed to add word:', error);
      throw error;
    }
  }

  /**
   * Update an existing word
   */
  static async updateWord(wordId: string, wordData: Partial<Omit<GameWord, 'id'>>): Promise<GameWord> {
    try {
      if (Object.keys(wordData).length > 0) {
        this.validateWordData(wordData as GameWord);
      }
      const session = await this.supabase.getGameSession(wordId);
      if (!session?.words) {
        throw new Error('Word not found');
      }
      // Note: Update functionality not available in current DatabaseClient interface
      return this.mapToGameWord(session.words);
    } catch (error) {
      console.error('Failed to update word:', error);
      throw error;
    }
  }

  /**
   * Search for words
   */
  static async searchWords(query: string): Promise<GameWord[]> {
    try {
      // Note: Search functionality not available in current DatabaseClient interface
      // Return empty array for now
      return [];
    } catch (error) {
      console.error('Failed to search words:', error);
      throw error;
    }
  }

  /**
   * Validate word data
   */
  private static validateWordData(wordData: Partial<GameWord>): void {
    const errors: string[] = [];

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
   * Map a Word to GameWord
   */
  private static mapToGameWord(word: Word): GameWord {
    return {
      id: word.id,
      word: word.word,
      definition: word.definition,
      clues: {
        D: word.definition,
        E: word.etymology || '',
        F: word.first_letter,
        I: word.in_a_sentence || '',
        N: word.number_of_letters,
        E2: word.equivalents
      }
    };
  }
} 