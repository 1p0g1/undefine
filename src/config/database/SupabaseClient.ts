import { createClient } from '@supabase/supabase-js';
import type { DatabaseClient, DbWord, DbUserStats, GameSession, User, ClueType, ClueStatus } from './types.ts';

export class SupabaseClient implements DatabaseClient {
  private client;
  private static instance: SupabaseClient;

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    console.log('Initializing Supabase client with URL:', supabaseUrl);
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  public static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = new SupabaseClient();
    }
    return SupabaseClient.instance;
  }

  async connect(): Promise<void> {
    try {
      console.log('Attempting to connect to Supabase...');
      const { data, error } = await this.client
        .from('words')
        .select('word')
        .limit(1);

      if (error) {
        console.error('Error connecting to Supabase:', error);
        throw error;
      }
      console.log('Successfully connected to Supabase. Test query result:', data);
    } catch (error) {
      console.error('Failed to connect to Supabase:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // No explicit disconnect needed for Supabase
    return Promise.resolve();
  }

  // Word operations
  async getDailyWord(date?: string): Promise<DbWord | null> {
    try {
      console.log('Attempting to get a random word from Supabase...');
      // Get a random word using ORDER BY RANDOM()
      const { data, error } = await this.client
        .from('words')
        .select('id, word, definition, etymology, first_letter, in_a_sentence, number_of_letters, equivalents, difficulty')
        .order('RANDOM()')
        .limit(1)
        .single();

      if (error) {
        console.error('Error getting word:', error);
        return null;
      }

      if (!data) {
        console.log('No words found in database');
        return null;
      }

      console.log('Successfully retrieved word:', { id: data.id, word: data.word });
      return data as DbWord;
    } catch (error) {
      console.error('Error in getDailyWord:', error);
      return null;
    }
  }

  async checkGuess(wordId: string, guess: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('words')
        .select('word')
        .eq('id', wordId)
        .single();

      if (error) throw error;
      return data.word.toLowerCase() === guess.toLowerCase();
    } catch (error) {
      console.error('Error in checkGuess:', error);
      throw error;
    }
  }

  // Stats operations
  async getUserStats(username: string): Promise<DbUserStats | null> {
    const { data, error } = await this.client
      .from('user_stats')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as DbUserStats;
  }

  async updateUserStats(
    username: string,
    won: boolean,
    guessesUsed: number,
    timeTaken: number
  ): Promise<void> {
    const { data: currentStats } = await this.client
      .from('user_stats')
      .select('*')
      .eq('username', username)
      .single();

    const newStats = {
      username,
      games_played: (currentStats?.games_played || 0) + 1,
      games_won: (currentStats?.games_won || 0) + (won ? 1 : 0),
      average_guesses: currentStats 
        ? ((currentStats.average_guesses * currentStats.games_played) + guessesUsed) / (currentStats.games_played + 1)
        : guessesUsed,
      average_time: currentStats
        ? ((currentStats.average_time * currentStats.games_played) + timeTaken) / (currentStats.games_played + 1)
        : timeTaken,
      current_streak: won ? (currentStats?.current_streak || 0) + 1 : 0,
      longest_streak: Math.max(currentStats?.longest_streak || 0, won ? (currentStats?.current_streak || 0) + 1 : 0),
      last_played_at: new Date().toISOString()
    };

    const { error } = await this.client
      .from('user_stats')
      .upsert(newStats);

    if (error) throw error;
  }

  // Game operations
  async getGameSession(gameId: string): Promise<GameSession | null> {
    const { data, error } = await this.client
      .from('game_sessions')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) {
      console.error('Error getting game session:', error);
      return null;
    }
    return data as GameSession;
  }

  async startGame(): Promise<GameSession> {
    const dailyWord = await this.getDailyWord();
    if (!dailyWord) throw new Error('No daily word available');

    const initialClueStatus: ClueStatus = {
      D: 'neutral',  // Definition is shown at start
      E: 'grey',     // Etymology
      F: 'grey',     // First Letter
      I: 'grey',     // In a Sentence
      N: 'grey',     // Number of Letters
      E2: 'grey'     // Equivalents
    };

    const session: GameSession = {
      id: crypto.randomUUID(),
      word_id: dailyWord.id,
      word: dailyWord.word,
      start_time: new Date().toISOString(),
      guesses: [],
      guesses_used: 0,
      revealed_clues: ['D'],  // Definition is revealed at start
      clue_status: initialClueStatus,
      is_complete: false,
      is_won: false
    };

    const { error } = await this.client
      .from('game_sessions')
      .insert(session);

    if (error) throw error;
    return session;
  }

  async processGuess(
    gameId: string,
    guess: string,
    session: GameSession
  ): Promise<{ isCorrect: boolean; gameOver: boolean; updatedSession: GameSession }> {
    if (!session) throw new Error('Game session not found');

    const isCorrect = guess.toLowerCase() === session.word.toLowerCase();
    session.guesses.push(guess);
    session.guesses_used++;

    const clueOrder: ClueType[] = ['D', 'E', 'F', 'I', 'N', 'E2'];
    
    if (isCorrect) {
      // Mark the last revealed clue as green
      const lastClue = session.revealed_clues[session.revealed_clues.length - 1];
      session.clue_status[lastClue] = 'green';
      session.is_complete = true;
      session.is_won = true;
      session.end_time = new Date().toISOString();
    } else {
      // Reveal next clue if not the last guess
      if (session.guesses_used < 6) {
        const nextClueIndex = session.revealed_clues.length;
        if (nextClueIndex < clueOrder.length) {
          const nextClue = clueOrder[nextClueIndex];
          session.revealed_clues.push(nextClue);
          session.clue_status[nextClue] = 'red';
        }
      }

      // Check if game is over (6 guesses used)
      if (session.guesses_used >= 6) {
        session.is_complete = true;
        session.end_time = new Date().toISOString();
      }
    }

    // Update session in database
    const { error } = await this.client
      .from('game_sessions')
      .update(session)
      .eq('id', gameId);

    if (error) throw error;

    return {
      isCorrect,
      gameOver: session.is_complete,
      updatedSession: session
    };
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<string | number | null> {
    const word = await this.getDailyWord();
    if (!word) return null;

    // Only return clue if it has been revealed
    if (!session.revealed_clues.includes(clueType)) {
      return null;
    }

    switch (clueType) {
      case 'D': return word.definition;
      case 'E': return word.etymology ?? null;
      case 'F': return word.first_letter ?? null;
      case 'I': return word.in_a_sentence ?? null;
      case 'N': return word.number_of_letters ?? null;
      case 'E2': return word.equivalents ?? null;
      default: return null;
    }
  }

  async endGame(gameId: string, won: boolean): Promise<void> {
    // Since we're not persisting game sessions, this is a no-op
    return Promise.resolve();
  }

  // User operations
  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as User;
  }

  async createUser(username: string): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .insert([{ username, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }
} 