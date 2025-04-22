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
      const { data: wordData, error: wordError } = await this.client
        .from('words')
        .select('*')
        .eq('id', session.word_id)
        .single();

      if (wordError || !wordData) {
        throw new Error('Word not found');
      }

      const isCorrect = wordData.word.toLowerCase() === guess.toLowerCase();
      const gameOver = isCorrect || (session.guesses_used || 0) >= 6;

      return {
        success: true,
        data: {
          isCorrect,
          guess,
          gameOver,
          isFuzzy: false,
          fuzzyPositions: [],
          correctWord: gameOver ? wordData.word : undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GUESS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process guess'
        }
      };
    }
  }

  async getUserStats(username: string): Promise<Result<UserStats | null>> {
    try {
      const { data, error } = await this.client
        .from('user_stats')
        .select('*')
        .eq('username', username)
        .single();
        
      if (error) throw error;
      if (!data) return { success: true, data: null };

      return {
        success: true,
        data: {
          username,
          games_played: data.games_played,
          games_won: data.games_won,
          average_guesses: data.average_guesses,
          average_time: data.average_time,
          current_streak: data.current_streak,
          longest_streak: data.longest_streak,
          last_played_at: data.last_played_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
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

  async getGameSession(gameId: string): Promise<GameSession | null> {
    try {
      // Join with words table to get the canonical word
      const { data: rawData, error } = await this.client
        .from('game_sessions')
        .select(`
          id,
          word_id,
          guesses,
          guesses_used,
          revealed_clues,
          clue_status,
          is_complete,
          is_won,
          start_time,
          end_time,
          state,
          canonical_word:words!word_id(
            id,
            word,
            definition,
            first_letter,
            number_of_letters,
            equivalents
          )
        `)
        .eq('id', gameId)
        .single();
        
      if (error) {
        console.error('Error fetching game session:', {
          error,
          gameId,
          code: error.code,
          details: error.details
        });
        return null;
      }
      
      if (!rawData) {
        console.error('No game session found:', { gameId });
        return null;
      }
      
      // Ensure canonical_word is properly typed as a single object
      const data = {
        ...rawData,
        canonical_word: Array.isArray(rawData.canonical_word)
          ? rawData.canonical_word[0]
          : rawData.canonical_word
      };
      
      // Validate canonical word data is present
      if (!data.canonical_word?.word) {
        console.error('Game session missing canonical word:', {
          gameId,
          wordId: data.word_id,
          hasCanonicalWord: !!data.canonical_word
        });
        return null;
      }
      
      // Construct session with canonical word data
      const session: GameSession = {
        id: data.id,
        word_id: data.word_id,
        word: data.canonical_word?.word ?? '',
        start_time: data.start_time,
        guesses: data.guesses || [],
        guesses_used: data.guesses_used || 0,
        revealed_clues: data.revealed_clues || [],
        clue_status: data.clue_status || {
          D: 'grey',
          E: 'grey',
          F: 'grey',
          I: 'grey',
          N: 'grey',
          E2: 'grey'
        },
        is_complete: data.is_complete || false,
        is_won: data.is_won || false,
        state: data.state || 'active'
      };
      
      return session;
    } catch (error) {
      console.error('Error in getGameSession:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        gameId
      });
      return null;
    }
  }

  async startGame(): Promise<GameSession> {
    try {
      // Get today's word - this ensures we use the same word for clues and gameplay
      const dailyWordResult = await this.getDailyWord();
      if (!dailyWordResult.success || !dailyWordResult.data) {
        throw new Error('No daily word available');
      }
      
      const dailyWord = dailyWordResult.data;
      
      // Debug log to confirm word ID consistency
      console.log('Starting game with word:', {
        id: dailyWord.id,
        wordLength: dailyWord.word.length,
        source: 'getDailyWord'
      });
      
      // Validate word data before creating session
      if (!dailyWord.id || !dailyWord.word || !dailyWord.definition) {
        throw new Error('Invalid word data for game session');
      }
      
      const initialClueStatus: Record<ClueType, string> = {
        D: 'neutral',
        E2: 'neutral',
        F: 'neutral',
        I: 'neutral',
        N: 'neutral',
        E: 'neutral'
      };
      
      const session = {
        id: randomUUID(),
        word_id: dailyWord.id,
        word: dailyWord.word,
        start_time: new Date().toISOString(),
        guesses: [],
        guesses_used: 0,
        revealed_clues: [],
        clue_status: initialClueStatus,
        is_complete: false,
        is_won: false,
        state: 'active'
      };
      
      // Create game session with the word
      const { data, error } = await this.client
        .from('game_sessions')
        .insert(session)
        .select('*, words:word_id(*)') // Join with words table to ensure word exists
        .single();
        
      if (error) {
        console.error('Error creating game session:', {
          error,
          wordId: dailyWord.id,
          sessionId: session.id
        });
        throw error;
      }
      
      if (!data) {
        throw new Error('Failed to create game session');
      }
      
      // Debug log to confirm word consistency
      console.log('Game session created with word:', {
        sessionId: data.id,
        wordId: data.word_id,
        word: data.word,
        hasCanonicalWord: !!data.canonical_word?.word,
        canonicalWord: data.canonical_word?.word,
        match: data.word === data.canonical_word?.word
      });
      
      return data as unknown as GameSession;
    } catch (error) {
      console.error('Error in startGame:', error);
      throw error;
    }
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<string | null> {
    try {
      const { data, error } = await this.client
        .from('words')
        .select('*')
        .eq('id', session.word_id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      switch (clueType) {
        case 'D': return data.definition;
        case 'E': return data.etymology;
        case 'F': return data.first_letter;
        case 'I': return data.in_a_sentence;
        case 'N': return data.number_of_letters?.toString() || null;
        case 'E2': return data.equivalents ? data.equivalents.join(', ') : null;
        default: return null;
      }
    } catch (error) {
      console.error('Error in getClue:', error);
      return null;
    }
  }

  async endGame(gameId: string, won: boolean): Promise<void> {
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
        throw error;
      }
    } catch (error) {
      console.error('Error in endGame:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
        
      if (error) {
        console.error('Error getting user:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return null;
    }
  }

  async createUser(username: string): Promise<User> {
    try {
      const user = {
        id: randomUUID(),
        username,
        created_at: new Date().toISOString()
      };
      
      const { error } = await this.client
        .from('users')
        .insert(user);
        
      if (error) {
        throw error;
      }
      
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
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
        .from('user_stats')
        .select('username, games_won')
        .order('games_won', { ascending: false })
        .limit(limit || 10);
        
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data.map((entry, index) => ({
          username: entry.username,
          score: entry.games_won,
          rank: index + 1
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LEADERBOARD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch leaderboard'
        }
      };
    }
  }

  async getTopStreaks(limit?: number): Promise<Result<StreakLeader[]>> {
    try {
      const { data, error } = await this.client
        .from('user_stats')
        .select('username, current_streak, longest_streak')
        .order('longest_streak', { ascending: false })
        .limit(limit || 10);
        
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data.map(entry => ({
          username: entry.username,
          current_streak: entry.current_streak,
          longest_streak: entry.longest_streak
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STREAK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch streak leaders'
        }
      };
    }
  }
}
