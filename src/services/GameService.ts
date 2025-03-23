import { db } from '../config/database/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface GameState {
  word: Word;
  startTime: Date;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
  userEmail: string;
}

export interface Word {
  wordId: string;
  word: string;
  definition: string;
  partOfSpeech: string;
}

export interface GuessResult {
  isCorrect: boolean;
  correctWord?: string;
  guessedWord: string;
  isFuzzy: boolean;
  fuzzyPositions: number[];
  remainingGuesses: number;
  leaderboardRank?: number;
}

export interface GameResponse {
  gameId: string;
  word: {
    id: string;
    definition: string;
    partOfSpeech: string;
  };
}

export class GameService {
  private static activeGames = new Map<string, GameState>();

  static async getRandomWord(): Promise<Word> {
    try {
      console.log('[GameService.getRandomWord] Attempting to fetch random word from database');
      const word = await db.getRandomWord();
      console.log('[GameService.getRandomWord] Successfully fetched word:', { wordId: word.wordId });
      return word;
    } catch (error) {
      console.error('[GameService.getRandomWord] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async startGame(userEmail: string): Promise<GameResponse> {
    try {
      console.log('[GameService.startGame] Starting new game for user:', userEmail);
      const word = await this.getRandomWord();
      const gameId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      console.log('[GameService.startGame] Creating game state:', { 
        gameId,
        wordId: word.wordId,
        userEmail 
      });

      this.activeGames.set(gameId, {
        word,
        startTime: new Date(),
        guessCount: 0,
        fuzzyCount: 0,
        hintCount: 0,
        userEmail
      });

      console.log('[GameService.startGame] Game successfully created');
      return {
        gameId,
        word: {
          id: word.wordId,
          definition: word.definition,
          partOfSpeech: word.partOfSpeech
        }
      };
    } catch (error) {
      console.error('[GameService.startGame] Error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userEmail
      });
      throw error;
    }
  }

  static async processGuess(gameId: string, guess: string): Promise<GuessResult> {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) {
      throw new Error('Game not found');
    }

    const { word: currentWord } = gameState;
    gameState.guessCount++;
    
    const isCorrect = guess.toLowerCase() === currentWord.word.toLowerCase();
    const isFuzzy = !isCorrect && this.isFuzzyMatch(guess, currentWord.word);
    const isGameOver = isCorrect || gameState.guessCount >= 6;
    
    if (isFuzzy) {
      gameState.fuzzyCount++;
    }
    
    const fuzzyPositions = this.calculateFuzzyPositions(guess, currentWord.word);
    
    if (isCorrect || isGameOver) {
      try {
        if (isCorrect) {
          console.log(`[GameService.processGuess] Correct guess for word: ${currentWord.word}`);
          
          // Update word usage metrics
          await db.markAsUsed(currentWord.wordId);
          
          // For early user testing, we'll conditionally disable leaderboard operations
          // but keep streak tracking functional
          const isLeaderboardEnabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_LEADERBOARD !== 'true';
          
          if (isLeaderboardEnabled) {
            // Add to leaderboard only in production mode with leaderboard enabled
            const timeTaken = Date.now() - gameState.startTime.getTime();
            await db.addToLeaderboard({
              username: gameState.userEmail,
              word: currentWord.word,
              guesses: gameState.guessCount,
              completion_time_seconds: Math.floor(timeTaken / 1000),
              used_hint: gameState.hintCount > 0,
              completed: isCorrect,
              created_at: new Date().toISOString()
            });
          } else {
            console.log('[GameService.processGuess] Leaderboard operations disabled for early user testing');
          }
          
          // Always update user stats to maintain streaks
          if (gameState.userEmail) {
            try {
              await db.updateUserStats(gameState.userEmail);
              console.log(`[GameService.processGuess] User stats and streak updated for: ${gameState.userEmail}`);
            } catch (statsError) {
              console.error('[GameService.processGuess] Error updating user stats:', {
                error: statsError instanceof Error ? statsError.message : 'Unknown error',
                stack: statsError instanceof Error ? statsError.stack : undefined
              });
            }
          }
        } else {
          console.log(`[GameService.processGuess] Game over without correct guess for word: ${currentWord.word}`);
        }
      } catch (error) {
        console.error('[GameService.processGuess] Error updating game results:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          gameId,
          wordId: currentWord.wordId
        });
        // Continue with game completion even if database operations fail
      }
      
      this.activeGames.delete(gameId);
    }
    
    // Conditionally include leaderboard rank in response
    const isLeaderboardEnabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_LEADERBOARD !== 'true';
    
    return {
      isCorrect,
      correctWord: isGameOver ? currentWord.word : undefined,
      guessedWord: guess,
      isFuzzy,
      fuzzyPositions,
      remainingGuesses: 6 - gameState.guessCount,
      leaderboardRank: isCorrect && isLeaderboardEnabled ? await db.getLeaderboardRank(gameId) : undefined
    };
  }

  private static isFuzzyMatch(guess: string, correct: string): boolean {
    const normalizedGuess = guess.toLowerCase();
    const normalizedCorrect = correct.toLowerCase();

    if (normalizedCorrect.startsWith(normalizedGuess) || normalizedGuess.startsWith(normalizedCorrect)) {
      return true;
    }

    const minLength = Math.min(normalizedGuess.length, normalizedCorrect.length);
    const commonPrefixLength = [...Array(minLength)].findIndex((_, i) => 
      normalizedGuess[i] !== normalizedCorrect[i]
    );
    
    if (commonPrefixLength > 4) {
      return true;
    }

    const matrix: number[][] = [];
    for (let i = 0; i <= normalizedGuess.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= normalizedCorrect.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= normalizedGuess.length; i++) {
      for (let j = 1; j <= normalizedCorrect.length; j++) {
        if (normalizedGuess[i-1] === normalizedCorrect[j-1]) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1,
            matrix[i][j-1] + 1,
            matrix[i-1][j] + 1
          );
        }
      }
    }

    const distance = matrix[normalizedGuess.length][normalizedCorrect.length];
    const maxLength = Math.max(normalizedGuess.length, normalizedCorrect.length);
    const threshold = Math.max(2, Math.floor(maxLength * 0.3));
    
    return distance <= threshold;
  }

  private static calculateFuzzyPositions(guess: string, correct: string): number[] {
    const guessLetters = guess.toLowerCase().split('');
    const correctLetters = correct.toLowerCase().split('');
    const positions: number[] = [];
    
    guessLetters.forEach((letter: string, index: number) => {
      if (index < correctLetters.length && letter === correctLetters[index]) {
        positions.push(index);
      }
    });
    
    return positions.length > 0 ? positions : [0];
  }

  static cleanupOldGames(): void {
    const now = Date.now();
    for (const [gameId, gameState] of this.activeGames.entries()) {
      if (now - gameState.startTime.getTime() > 24 * 60 * 60 * 1000) {
        this.activeGames.delete(gameId);
      }
    }
  }

  /**
   * Fetches the word of the day and immediately marks it as used
   * This is typically used for the daily word challenge feature
   * @returns The word of the day with its definition and part of speech
   */
  static async getTodayWord(): Promise<Word> {
    try {
      console.log('[GameService.getTodayWord] Fetching today\'s word');
      
      // Fetch a random word for today
      const word = await this.getRandomWord();
      
      // Mark it as used immediately
      await db.markAsUsed(word.wordId);
      
      console.log('[GameService.getTodayWord] Successfully fetched and marked today\'s word');
      return word;
    } catch (error) {
      console.error('[GameService.getTodayWord] Error fetching today\'s word:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to get today's word: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 