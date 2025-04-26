// ✅ This is the official SupabaseClient used across Un-Define
// Implements the DatabaseClient interface from shared/types.ts
// Do not duplicate this file — update here only
import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { 
  ClueStatus,
  ClueType,
  DatabaseClient, 
  GameSession,
  GameState,
  GuessResult,
  User,
  UserStats,
  WordData,
  Result,
  LeaderboardEntry,
  StreakLeader
} from '../../../packages/shared-types/src/index.js';

// Define database types for Supabase
interface Database {
  public: {
    Tables: {
      words: {
        Row: {
          id: string;
          word: string;
          definition: string;
          etymology: string | null;
          first_letter: string | null;
          in_a_sentence: string | null;
          number_of_letters: number | null;
          equivalents: string[] | null;
          difficulty: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          word: string;
          definition: string;
          etymology?: string | null;
          first_letter?: string | null;
          in_a_sentence?: string | null;
          number_of_letters?: number | null;
          equivalents?: string[] | null;
          difficulty?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          word?: string;
          definition?: string;
          etymology?: string | null;
          first_letter?: string | null;
          in_a_sentence?: string | null;
          number_of_letters?: number | null;
          equivalents?: string[] | null;
          difficulty?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          word: string;
          start_time: string;
          end_time: string | null;
          guesses: string[];
          guesses_used: number;
          revealed_clues: number[];
          clue_status: Record<ClueType, string>;
          is_complete: boolean;
          is_won: boolean;
          state: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: string;
          word: string;
          start_time?: string;
          end_time?: string | null;
          guesses?: string[];
          guesses_used?: number;
          revealed_clues?: number[];
          clue_status?: Record<ClueType, string>;
          is_complete?: boolean;
          is_won?: boolean;
          state?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: string;
          word?: string;
          start_time?: string;
          end_time?: string | null;
          guesses?: string[];
          guesses_used?: number;
          revealed_clues?: number[];
          clue_status?: Record<ClueType, string>;
          is_complete?: boolean;
          is_won?: boolean;
          state?: string;
        };
      };
      user_stats: {
        Row: {
          username: string;
          games_played: number;
          games_won: number;
          average_guesses: number;
          average_time: number;
          current_streak: number;
          longest_streak: number;
          last_played_at: string;
        };
        Insert: {
          username: string;
          games_played?: number;
          games_won?: number;
          average_guesses?: number;
          average_time?: number;
          current_streak?: number;
          longest_streak?: number;
          last_played_at?: string;
        };
        Update: {
          username?: string;
          games_played?: number;
          games_won?: number;
          average_guesses?: number;
          average_time?: number;
          current_streak?: number;
          longest_streak?: number;
          last_played_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
      };
    };
  };
}

interface LeaderboardQueryResult {
  id: string;
  user_id: string;
  word_id: string;
  word: string;
  guesses_used: number;
  end_time: string;
  start_time: string;
  score: number;
  duration: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  users: {
    username: string;
  }[];
}

export class SupabaseClient implements DatabaseClient {
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
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
            if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      SupabaseClient.instance = new SupabaseClient(supabaseUrl, supabaseKey);
        }
        return SupabaseClient.instance;
    }

  async connect(): Promise<Result<void>> {
    try {
      await this.client.auth.getSession();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONNECTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to connect'
        }
      };
    }
  }

  async disconnect(): Promise<Result<void>> {
    return { success: true };
  }

  async getRandomWord(): Promise<Result<WordData>> {
    try {
            const { data, error } = await this.client
                .from('words')
        .select('*')
        .order('RANDOM()')
                .limit(1)
        .single();

      if (error || !data) {
                throw new Error('Failed to fetch random word');
            }

      // Convert database row to WordData format
            return {
        success: true,
        data: {
          id: data.id,
          word: data.word,
          definition: data.definition,
          etymology: data.etymology,
          first_letter: data.first_letter || data.word.charAt(0),
          in_a_sentence: data.in_a_sentence,
          number_of_letters: data.number_of_letters || data.word.length,
          equivalents: data.equivalents ? data.equivalents.join(', ') : null,
          difficulty: data.difficulty || 'Medium',
          created_at: data.created_at,
          updated_at: data.updated_at,
          clues: {
            D: data.definition,
            E: data.etymology,
            F: data.first_letter || data.word.charAt(0),
            I: data.in_a_sentence,
            N: data.number_of_letters || data.word.length,
            E2: data.equivalents ? data.equivalents.join(', ') : null
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WORD_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch word'
        }
      };
    }
  }

  async getDailyWord(): Promise<Result<WordData>> {
    return this.getRandomWord();
  }

  async processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<GuessResult>> {
    try {
      // Get the word from the database
      const { data: word, error } = await this.client
        .from('words')
        .select('*')
        .eq('id', session.wordId)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      if (!word) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Word not found'
          }
        };
      }

      const isCorrect = guess.toLowerCase() === word.word.toLowerCase();
      const gameOver = isCorrect || (session.guessesUsed || 0) >= 6;

      // Update game session
      const { error: updateError } = await this.client
        .from('game_sessions')
        .update({
          guesses: [...(session.guesses || []), guess],
          guesses_used: (session.guessesUsed || 0) + 1,
          is_complete: gameOver,
          is_won: isCorrect,
          end_time: gameOver ? new Date().toISOString() : undefined
        })
        .eq('id', gameId);

      if (updateError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: updateError.message,
            details: updateError
          }
        };
      }

      return {
        success: true,
        data: {
          isCorrect,
          guess,
          isFuzzy: false,
          fuzzyPositions: [],
          gameOver,
          correctWord: gameOver ? word.word : undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to process guess',
          details: error
        }
      };
    }
  }

  async getUserStats(username: string): Promise<Result<UserStats | null>> {
    try {
      const { data: stats, error } = await this.client
        .from('user_stats')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      if (!stats) {
        return {
          success: true,
          data: null
        };
      }

      return {
        success: true,
        data: {
          username: stats.username,
          gamesPlayed: stats.games_played,
          gamesWon: stats.games_won,
          averageGuesses: stats.average_guesses,
          averageTime: stats.average_time,
          currentStreak: stats.current_streak,
          longestStreak: stats.longest_streak,
          lastPlayedAt: stats.last_played_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get user stats',
          details: error
        }
      };
    }
  }

  async updateUserStats(
    username: string,
    won: boolean,
    guessesUsed: number,
    timeTaken: number
  ): Promise<Result<void>> {
    try {
            const { error } = await this.client
                .from('user_stats')
        .upsert({
          username,
          games_played: 1,
          games_won: won ? 1 : 0,
          average_guesses: guessesUsed,
          average_time: timeTaken,
          current_streak: won ? 1 : 0,
          longest_streak: won ? 1 : 0,
          last_played_at: new Date().toISOString()
        });
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async getGameSession(gameId: string): Promise<Result<GameSession>> {
    try {
      const { data: session, error } = await this.client
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      if (!session) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Game session not found'
          }
        };
      }

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.user_id,
          wordId: session.word_id,
          word: session.word,
          startTime: session.start_time,
          endTime: session.end_time || undefined,
          guesses: session.guesses || [],
          hintsRevealed: session.revealed_clues || [],
          completed: session.is_complete,
          won: session.is_won,
          guessesUsed: session.guesses_used,
          revealedClues: session.revealed_clues,
          isComplete: session.is_complete,
          isWon: session.is_won,
          state: session.state
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get game session',
          details: error
        }
      };
    }
  }

  async startGame(): Promise<Result<GameSession>> {
    try {
      // Get a random word
      const wordResult = await this.getRandomWord();
      if (!wordResult.success || !wordResult.data) {
        return {
          success: false,
          error: {
            code: 'WORD_ERROR',
            message: 'Failed to get random word',
            details: wordResult.error
          }
        };
      }

      const word = wordResult.data;

      // Create a new game session
      const { data: session, error } = await this.client
        .from('game_sessions')
        .insert({
          id: randomUUID(),
          user_id: 'anonymous', // TODO: Replace with actual user ID
          word_id: word.id,
          word: word.word,
          start_time: new Date().toISOString(),
          guesses: [],
          guesses_used: 0,
          revealed_clues: [],
          is_complete: false,
          is_won: false,
          state: 'active'
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.user_id,
          wordId: session.word_id,
          word: session.word,
          startTime: session.start_time,
          endTime: session.end_time || undefined,
          guesses: session.guesses || [],
          hintsRevealed: session.revealed_clues || [],
          completed: session.is_complete,
          won: session.is_won,
          guessesUsed: session.guesses_used,
          revealedClues: session.revealed_clues,
          isComplete: session.is_complete,
          isWon: session.is_won,
          state: session.state
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to start game',
          details: error
        }
      };
    }
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<Result<string>> {
    try {
      const { data: word, error } = await this.client
        .from('words')
        .select('*')
        .eq('id', session.wordId)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      if (!word) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Word not found'
          }
        };
      }

      let clue: string | null = null;
      switch (clueType) {
        case 'D':
          clue = word.definition;
          break;
        case 'E':
          clue = word.etymology;
          break;
        case 'F':
          clue = word.first_letter;
          break;
        case 'I':
          clue = word.in_a_sentence;
          break;
        case 'N':
          clue = word.number_of_letters?.toString() || null;
          break;
        case 'E2':
          clue = word.equivalents?.join(', ') || null;
          break;
      }

      if (!clue) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Clue not found'
          }
        };
      }

      return {
        success: true,
        data: clue
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get clue',
          details: error
        }
      };
    }
  }

  async endGame(gameId: string, won: boolean): Promise<Result<void>> {
    try {
      const { error } = await this.client
        .from('game_sessions')
        .update({
          is_complete: true,
          is_won: won,
          end_time: new Date().toISOString()
        })
        .eq('id', gameId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to end game',
          details: error
        }
      };
    }
  }

  async getUserByUsername(username: string): Promise<Result<User | null>> {
    try {
      const { data: user, error } = await this.client
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      if (!user) {
        return {
          success: true,
          data: null
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email || undefined,
          created_at: user.created_at,
          last_login: user.last_login || undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get user',
          details: error
        }
      };
    }
  }

  async createUser(username: string): Promise<Result<User>> {
    try {
      const { data: user, error } = await this.client
        .from('users')
        .insert({
          id: randomUUID(),
          username,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email || undefined,
          created_at: user.created_at,
          last_login: user.last_login || undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to create user',
          details: error
        }
      };
    }
  }

  async getNextHint(gameId: string): Promise<Result<string>> {
    try {
      const { data: sessionData, error: sessionError } = await this.client
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Game session not found');
      }

      const { data: wordData, error: wordError } = await this.client
            .from('words')
            .select('*')
        .eq('id', sessionData.word_id)
            .single();

      if (wordError || !wordData) {
            throw new Error('Word not found');
      }

      return {
        success: true,
        data: wordData.definition
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HINT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async submitScore(gameId: string, score: number): Promise<Result<void>> {
    try {
      const { error } = await this.client
        .from('game_sessions')
        .update({ score })
        .eq('id', gameId);
        
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SCORE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to submit score'
        }
      };
    }
  }

  async checkGuess(wordId: string, guess: string): Promise<boolean> {
        try {
            const { data, error } = await this.client
                .from('words')
                .select('word')
                .eq('id', wordId)
                .single();
        
      if (error) {
                throw error;
      }
      
            return data.word.toLowerCase() === guess.toLowerCase();
    } catch (error) {
            console.error('Error in checkGuess:', error);
            throw error;
        }
    }

  async getLeaderboard(limit?: number): Promise<Result<LeaderboardEntry[]>> {
    try {
      const { data, error } = await this.client
        .from('game_sessions')
        .select(`
          id,
          user_id,
          word_id,
          word,
          guesses_used,
          end_time,
          start_time,
          users!user_id(username)
        `)
        .eq('is_complete', true)
        .eq('is_won', true)
        .order('guesses_used', { ascending: true })
        .order('end_time', { ascending: true })
        .limit(limit || 10);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: (data as LeaderboardQueryResult[]).map((entry, index) => ({
          username: entry.users[0].username,
          score: 100 - (entry.guesses_used * 10),
          rank: index + 1,
          wordId: entry.word_id,
          word: entry.word,
          timeTaken: new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime(),
          guessesUsed: entry.guesses_used
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get leaderboard',
          details: error
        }
      };
    }
  }

  async getTopStreaks(limit?: number): Promise<Result<StreakLeader[]>> {
    try {
      const { data, error } = await this.client
        .from('user_stats')
        .select('username, current_streak, longest_streak')
        .order('current_streak', { ascending: false })
        .limit(limit || 10);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data.map(entry => ({
          username: entry.username,
          currentStreak: entry.current_streak,
          longestStreak: entry.longest_streak,
          streak: entry.current_streak
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get top streaks',
          details: error
        }
      };
    }
  }

  async addLeaderboardEntry(entry: LeaderboardEntry): Promise<Result<void>> {
    try {
      const { error } = await this.client
        .from('game_sessions')
        .update({
          score: entry.score,
          guesses_used: entry.guessesUsed,
          end_time: new Date().toISOString()
        })
        .eq('word_id', entry.wordId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to add leaderboard entry',
          details: error
        }
      };
    }
  }

  async markAsUsed(wordId: string): Promise<Result<void>> {
    try {
      const { error } = await this.client
        .from('words')
        .update({ last_used: new Date().toISOString() })
        .eq('id', wordId);
      
      if (error) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: error.message,
            details: error
          }
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to mark word as used',
          details: error
        }
      };
    }
  }

  /**
   * Search for words using case-insensitive matching
   * @param query The search query (minimum 2 characters)
   * @returns A list of matching words
   */
  async searchWords(query: string): Promise<Result<WordData[]>> {
    try {
      if (!query || query.length < 2) {
        return {
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Search query must be at least 2 characters long'
          }
        };
      }

      const { data, error } = await this.client
        .from('words')
        .select('*')
        .ilike('word', `%${query}%`)
        .limit(20);

      if (error) {
        return {
          success: false,
          error: {
            code: 'SEARCH_ERROR',
            message: error.message
          }
        };
      }

      return {
        success: true,
        data: data as WordData[]
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      };
    }
  }
}
