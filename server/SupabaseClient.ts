import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { WordData, GameSession, DatabaseClient, Result } from '@undefine/shared-types';
import { env } from './config/env';

// Define database types for Supabase
interface Database {
  public: {
    Tables: {
      words: {
        Row: WordData;
      };
      game_sessions: {
        Row: {
          id: string;
          player_id: string;
          word_id: string;
          guesses: string[];
          hints_revealed: string[];
          is_complete: boolean;
          is_won: boolean;
          start_time: string;
          end_time: string | null;
        };
      };
    };
  };
}

function createError(message: string) {
  return {
    code: 'ERROR',
    message,
    details: undefined
  };
}

export class SupabaseClient {
  private client: SupabaseClientType<Database>;
  private static instance: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    this.client = createClient<Database>(supabaseUrl, supabaseKey);
  }

  static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = new SupabaseClient(
        env.supabase.url,
        env.supabase.serviceKey
      );
    }
    return SupabaseClient.instance;
  }

  async getDailyWord(): Promise<Result<WordData>> {
    try {
      const { data, error } = await this.client
        .from('words')
        .select('*')
        .single();
        
      if (error) {
        return {
          success: false,
          error: createError(error.message)
        };
      }
      
      if (!data) {
        return {
          success: false,
          error: createError('No word found')
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          word: data.word,
          definition: data.definition,
          etymology: data.etymology,
          first_letter: data.first_letter,
          number_of_letters: data.number_of_letters,
          in_a_sentence: data.in_a_sentence,
          equivalents: data.equivalents,
          difficulty: data.difficulty,
          created_at: data.created_at,
          updated_at: data.updated_at,
          clues: {
            D: data.definition,
            E: data.etymology,
            F: data.first_letter,
            I: data.in_a_sentence,
            N: data.number_of_letters,
            E2: data.equivalents
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: createError(error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  async startGame(): Promise<Result<GameSession>> {
    try {
      const { data: wordData, error: wordError } = await this.client
        .from('words')
        .select('*')
        .single();

      if (wordError || !wordData) {
        return {
          success: false,
          error: createError(wordError?.message || 'No word found to start game')
        };
      }

      const { data: session, error } = await this.client
        .from('game_sessions')
        .insert({
          word_id: wordData.id,
          player_id: 'anonymous', // TODO: Implement proper player authentication
          start_time: new Date().toISOString(),
          is_complete: false,
          is_won: false
        })
        .select()
        .single();

      if (error || !session) {
        return {
          success: false,
          error: createError(error?.message || 'Failed to create game session')
        };
      }

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.player_id,
          wordId: session.word_id,
          word: wordData.word,
          guesses: [],
          guessesUsed: 0,
          hintsRevealed: [],
          isComplete: session.is_complete,
          isWon: session.is_won,
          completed: session.is_complete,
          won: session.is_won,
          startTime: session.start_time,
          endTime: session.end_time
        }
      };
    } catch (error) {
      return {
        success: false,
        error: createError(error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  async getGameSession(gameId: string): Promise<Result<GameSession>> {
    try {
      const { data: session, error } = await this.client
        .from('game_sessions')
        .select(`
          *,
          word:words(*)
        `)
        .eq('id', gameId)
        .single();

      if (error) {
        return {
          success: false,
          error: createError(error.message)
        };
      }

      if (!session) {
        return {
          success: false,
          error: createError('Game session not found')
        };
      }

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.player_id,
          wordId: session.word_id,
          word: session.word.word,
          guesses: session.guesses || [],
          guessesUsed: session.guesses?.length || 0,
          hintsRevealed: session.hints_revealed || [],
          isComplete: session.is_complete,
          isWon: session.is_won,
          completed: session.is_complete,
          won: session.is_won,
          startTime: session.start_time,
          endTime: session.end_time
        }
      };
    } catch (error) {
      return {
        success: false,
        error: createError(error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  async processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<{
    isCorrect: boolean;
    guess: string;
    isFuzzy: boolean;
    fuzzyPositions: never[];
    gameOver: boolean;
    correctWord?: string;
  }>> {
    try {
      const { data: gameSession } = await this.client
        .from('game_sessions')
        .select(`
          *,
          word:words(*)
        `)
        .eq('id', gameId)
        .single();

      if (!gameSession) {
        return {
          success: false,
          error: createError('Game session not found')
        };
      }

      const isCorrect = guess.toLowerCase() === gameSession.word.word.toLowerCase();
      const guessesUsed = (gameSession.guesses?.length || 0) + 1;
      
      await this.client
        .from('game_sessions')
        .update({
          guesses: [...(gameSession.guesses || []), guess],
          is_complete: isCorrect || guessesUsed >= 5,
          is_won: isCorrect,
          end_time: (isCorrect || guessesUsed >= 5) ? new Date().toISOString() : null
        })
        .eq('id', gameId);
      
      return {
        success: true,
        data: {
          isCorrect,
          guess,
          isFuzzy: false,
          fuzzyPositions: [],
          gameOver: isCorrect || guessesUsed >= 5,
          correctWord: isCorrect ? gameSession.word.word : undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: createError(error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }
} 