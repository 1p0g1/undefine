import { getDb } from '../config/database/db.js';
import { WordEntry, GameSession } from '../shared/types/index.js';

export interface GameState {
  word: WordEntry;
  startTime: Date;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
  hints: {
    D: boolean;  // Definition (always revealed)
    E: boolean;  // Etymology
    F: boolean;  // First Letter
    I: boolean;  // In a sentence
    N: boolean;  // Number of letters
    E2: boolean; // Equivalents
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

export class GameService {
  static activeGames = new Map<string, GameState>();

  static async getRandomWord(): Promise<WordEntry> {
    try {
      console.log('[GameService.getRandomWord] Attempting to fetch random word from database');
      const word = await getDb().getRandomWord();
      console.log('[GameService.getRandomWord] Successfully fetched word:', { word: word.word });
      return word;
    } catch (error) {
      console.error('[GameService.getRandomWord] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async startGame(): Promise<GameResponse> {
    try {
      console.log('[GameService.startGame] Starting new game');
      const word = await this.getRandomWord();
      const session = await getDb().startGame();
      
      console.log('[GameService.startGame] Creating game state:', { 
        gameId: session.id,
        word: word.word
      });

      this.activeGames.set(session.id, {
        word,
        startTime: new Date(),
        guessCount: 0,
        fuzzyCount: 0,
        hintCount: 0,
        hints: {
          D: true,
          E: false,
          F: false,
          I: false,
          N: false,
          E2: false
        }
      });

      console.log('[GameService.startGame] Game successfully created');
      return {
        gameId: session.id,
        word: {
          word: word.word,
          definition: word.definition,
          letterCount: word.letterCount
        }
      };
    } catch (error) {
      console.error('[GameService.startGame] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async processGuess(gameId: string, guess: string): Promise<GuessResult> {
    try {
      const session = await getDb().getGameSession(gameId);
      if (!session) {
        throw new Error('Game session not found');
      }

      const result = await getDb().processGuess(gameId, guess, session);
      return {
        isCorrect: result.isCorrect,
        guess: result.guess,
        isFuzzy: result.isFuzzy,
        fuzzyPositions: result.fuzzyPositions,
        gameOver: result.gameOver,
        correctWord: result.correctWord
      };
    } catch (error) {
      console.error('[GameService.processGuess] Error processing guess:', error);
      throw error;
    }
  }

  private static isFuzzyMatch(guess: string, word: string): boolean {
    const normalize = (text: string): string => 
      text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

    const normalizedGuess = normalize(guess);
    const normalizedWord = normalize(word);
    
    return normalizedGuess.length >= 3 && normalizedWord.includes(normalizedGuess);
  }

  private static getFuzzyPositions(guess: string, word: string): number[] {
    const normalize = (text: string): string => 
      text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

    const normalizedGuess = normalize(guess);
    const normalizedWord = normalize(word);
    
    const positions: number[] = [];
    let index = normalizedWord.indexOf(normalizedGuess);
    
    while (index !== -1) {
      for (let i = 0; i < normalizedGuess.length; i++) {
        positions.push(index + i);
      }
      index = normalizedWord.indexOf(normalizedGuess, index + 1);
    }
    
    return positions;
  }

  static cleanupOldGames(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [gameId, state] of this.activeGames.entries()) {
      if (state.startTime.getTime() < oneHourAgo) {
        this.activeGames.delete(gameId);
      }
    }
  }

  /**
   * Fetches the word of the day and immediately marks it as used
   * This is typically used for the daily word challenge feature
   * @returns The word of the day with its definition and part of speech
   */
  static async getTodayWord(date?: string) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Try to get today's word
      let word = await getDb().getDailyWord(targetDate);
      
      // If no word is set for today, select one and mark it
      if (!word) {
        word = await getDb().getNextUnusedWord();
        if (!word) {
          throw new Error('No unused words available');
        }
        await getDb().setDailyWord(word.id, targetDate);
      }
      
      return word;
    } catch (error) {
      console.error('Error getting today\'s word:', error);
      throw error;
    }
  }
} 