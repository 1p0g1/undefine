// ✅ This is the official SupabaseClient used across Un-Define
// Implements the DatabaseClient interface from shared/types.ts
// Do not duplicate this file — update here only

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { 
  GameSession, 
  GuessResult,
  ClueType,
  ClueStatus,
  DatabaseClient,
  Word,
  User,
  UserStats,
  GameState
} from '../../types/shared.js';

// Re-export types we need
export type { GameSession, GuessResult };

interface GameSessionData {
  id: string;
  word_id: string;
  guesses: string[];
  guesses_used: number;
  revealed_clues: ClueType[];
  clue_status: ClueStatus;
  is_complete: boolean;
  is_won: boolean;
  start_time: string;
  end_time: string | null;
  state: GameState;
  canonical_word: {
    id: string;
    word: string;
    definition: string;
    first_letter: string;
    number_of_letters: number;
    equivalents: string[];
  };
}

export class SupabaseClient implements DatabaseClient {
  private client;
  private static instance: SupabaseClient;

  private constructor() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      // Validate environment variables
      if (!supabaseUrl || !supabaseKey) {
        const missingVars = [];
        if (!supabaseUrl) missingVars.push('SUPABASE_URL');
        if (!supabaseKey) missingVars.push('SUPABASE_ANON_KEY');
        
        console.error('Missing required Supabase environment variables:', {
          missingVariables: missingVars,
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        });
        throw new Error(`Missing required Supabase environment variables: ${missingVars.join(', ')}`);
      }

      // Validate URL format
      try {
        new URL(supabaseUrl);
      } catch (error) {
        console.error('Invalid Supabase URL format:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: supabaseUrl
        });
        throw new Error('Invalid Supabase URL format');
      }

      // Clean and validate key format (should be JWT)
      const cleanKey = supabaseKey.trim().replace(/\s+/g, '');
      const keyParts = cleanKey.split('.');
      
      console.log('Validating Supabase key format:', {
        partsCount: keyParts.length,
        keyLength: cleanKey.length,
        isJWT: keyParts.length === 3 && keyParts.every(part => part.length > 0)
      });

      if (keyParts.length !== 3 || !keyParts.every(part => part.length > 0)) {
        console.error('Invalid Supabase key format:', {
          expectedFormat: 'header.payload.signature',
          partsFound: keyParts.length,
          partLengths: keyParts.map(p => p.length)
        });
        throw new Error('Invalid Supabase key format');
      }

      console.log('Initializing Supabase client...');
      this.client = createClient(supabaseUrl, cleanKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      });
      
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  public static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      try {
        SupabaseClient.instance = new SupabaseClient();
      } catch (error) {
        console.error('Failed to create SupabaseClient instance:', error);
        throw error;
      }
    }
    return SupabaseClient.instance;
  }

  async connect(): Promise<void> {
    try {
      console.log('Testing Supabase connection...');
      
      // First test - simple connection
      console.log('Step 1: Testing basic connection...');
      const { data, error } = await this.client
        .from('words')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log('Connection test failed:', error);
        throw error;
      }

      console.log('✅ Basic connection test passed');

      // Second test - words table
      console.log('Step 2: Testing words table access...');
      const { data: wordsCheck, error: wordsError } = await this.client
        .from('words')
        .select('id')
        .limit(1);

      if (wordsError) {
        console.error('Failed to access words table:', {
          code: wordsError.code,
          msg: wordsError.message,
          details: wordsError.details,
          hint: wordsError.hint
        });
        throw new Error(`Failed to access words table: ${wordsError.message}`);
      }

      // Third test - permissions
      console.log('Step 3: Testing table permissions...');
      const testId = randomUUID();
      const testSession: Partial<GameSession> = {
        id: testId,
        word_id: undefined,
        word: 'testword',
        start_time: new Date().toISOString(),
        guesses: [],
        guesses_used: 0,
        revealed_clues: [],
        clue_status: {
          D: 'neutral',
          E: 'grey',
          F: 'grey',
          I: 'grey',
          N: 'grey',
          E2: 'grey'
        },
        is_complete: true,
        is_won: false,
        state: 'completed'
      };

      const { data: writeTest, error: writeError } = await this.client
        .from('game_sessions')
        .insert(testSession)
        .select()
        .single();

      if (writeError) {
        console.error('Failed write permission test:', {
          code: writeError.code,
          msg: writeError.message,
          details: writeError.details,
          hint: writeError.hint
        });
        throw new Error(`Failed write permission test: ${writeError.message}`);
      }

      // Cleanup test data
      if (writeTest) {
        await this.client
          .from('game_sessions')
          .delete()
          .eq('id', testId);
      }

      console.log('✅ Supabase connection tests passed successfully');
    } catch (error) {
      console.error('❌ Supabase connection test failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // No explicit disconnect needed for Supabase
    return Promise.resolve();
  }

  async getRandomWord(): Promise<Word> {
    try {
      console.log('Fetching random word...');
      
      const { data, error } = await this.client
        .from('words')
        .select('*')
        .limit(1)
        .order('RANDOM()');

      if (error || !data || data.length === 0) {
        console.error('Failed to fetch random word:', error);
        throw new Error('Failed to fetch random word');
      }

      const dbWord = data[0];

      // Log the raw word data for debugging
      console.log('Raw word data:', {
        id: dbWord.id,
        word: dbWord.word,
        hasDefinition: !!dbWord.definition,
        hasEtymology: !!dbWord.etymology,
        hasFirstLetter: !!dbWord.first_letter,
        hasInSentence: !!dbWord.in_a_sentence,
        hasEquivalents: !!dbWord.equivalents,
        equivalentsType: typeof dbWord.equivalents
      });

      // Return the word with snake_case fields as is
      return {
        id: dbWord.id,
        word: dbWord.word,
        definition: dbWord.definition,
        etymology: dbWord.etymology || '',
        first_letter: dbWord.first_letter,
        in_a_sentence: dbWord.in_a_sentence || '',
        number_of_letters: dbWord.number_of_letters,
        equivalents: Array.isArray(dbWord.equivalents) 
          ? dbWord.equivalents 
          : typeof dbWord.equivalents === 'string'
            ? dbWord.equivalents.split(',').map((s: string): string => s.trim())
            : [],
        difficulty: dbWord.difficulty || 'Medium'
      };
    } catch (error) {
      console.error('Error in getRandomWord:', error);
      throw error;
    }
  }

  async getDailyWord(): Promise<Word> {
    try {
      console.log('Getting daily word...');
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log('[DailyWord] Checking for existing word for:', today);
      
      // First try to get a word that's already assigned for today
      const { data: existingWord, error: existingError } = await this.client
        .from('words')
        .select(`
          id,
          word,
          definition,
          etymology,
          first_letter,
          in_a_sentence,
          number_of_letters,
          equivalents,
          difficulty,
          date
        `)
        .eq('date', today)
        .single();

      if (!existingError && existingWord) {
        console.log('[DailyWord] Found existing word for today:', {
          id: existingWord.id,
          wordLength: existingWord.word.length,
          date: existingWord.date
        });
        return existingWord;
      }

      // If no word is assigned for today, get a pool of unassigned words
      console.log('[DailyWord] No existing word found, looking for unassigned word...');
      
      let selectedWord: Word | null = null;
      
      const { data: unassignedWords, error: unassignedError } = await this.client
        .from('words')
        .select('*')
        .is('date', null)
        .order('RANDOM()')  // Randomize the selection
        .limit(1);  // Get just one random word

      if (unassignedError || !unassignedWords || unassignedWords.length === 0) {
        console.error('[DailyWord] Error getting unassigned word:', unassignedError);
        
        // If no unassigned words, reset all words to unassigned
        const { error: resetError } = await this.client
          .from('words')
          .update({ date: null })
          .neq('id', '-1');  // Update all words
          
        if (resetError) {
          console.error('[DailyWord] Error resetting words:', resetError);
          throw new Error('Failed to reset words');
        }
        
        // Try getting a random word again
        const { data: resetWords, error: retryError } = await this.client
          .from('words')
          .select('*')
          .order('RANDOM()')
          .limit(1);
          
        if (retryError || !resetWords || resetWords.length === 0) {
          throw new Error('No available words found even after reset');
        }
        
        selectedWord = resetWords[0];
      } else {
        selectedWord = unassignedWords[0];
      }

      if (!selectedWord) {
        throw new Error('Failed to select a word');
      }

      // Assign this word to today's date
      const { error: updateError } = await this.client
        .from('words')
        .update({ date: today })
        .eq('id', selectedWord.id);

      if (updateError) {
        console.error('[DailyWord] Error assigning word to today:', updateError);
        throw new Error('Failed to assign word to today');
      }

      console.log('[DailyWord] Successfully assigned new word for today:', {
        id: selectedWord.id,
        wordLength: selectedWord.word.length,
        date: today
      });

      return selectedWord;
    } catch (error) {
      console.error('[DailyWord] Error in getDailyWord:', error);
      throw error;
    }
  }

  async processGuess(
    gameId: string,
    guess: string,
    session: GameSession
  ): Promise<GuessResult> {
    try {
      // Validate session
      if (!session) {
        console.error('No session provided for guess processing:', { gameId });
        throw new Error('No game session found');
      }

      if (!session.word_id) {
        console.error('Session missing word_id:', { gameId });
        throw new Error('Invalid game session: missing word_id');
      }

      // First try to get word from session.words (joined data)
      let canonicalWord = session.words?.word;

      // If joined word is missing, fetch directly from words table
      if (!canonicalWord) {
        console.warn('Session missing joined word data, fetching from words table:', {
          gameId,
          wordId: session.word_id
        });

        const { data: wordData, error: wordError } = await this.client
          .from('words')
          .select('word')
          .eq('id', session.word_id)
          .single();

        if (wordError || !wordData?.word) {
          console.error('Failed to fetch canonical word:', {
            error: wordError,
            gameId,
            wordId: session.word_id
          });
          throw new Error('Failed to resolve canonical word');
        }

        canonicalWord = wordData.word;
      }

      // Ensure we have a canonical word
      if (!canonicalWord) {
        throw new Error('Failed to resolve canonical word after all attempts');
      }

      // Log word resolution
      console.log('Word resolution for guess:', {
        gameId,
        guess,
        wordSource: session.words?.word ? 'joined_data' : 'direct_fetch'
      });

      // Normalize strings for comparison
      const normalizedGuess = guess.trim().toLowerCase();
      const normalizedWord = canonicalWord.trim().toLowerCase();

      // Log comparison details
      console.log('Word comparison:', {
        gameId,
        normalizedGuess,
        normalizedWord,
        isMatch: normalizedGuess === normalizedWord,
        charComparison: Array.from(normalizedGuess).map((char, i) => ({
          position: i,
          guessChar: char,
          wordChar: normalizedWord[i],
          matches: char === normalizedWord[i]
        }))
      });

      // Strict comparison
      const isCorrect = normalizedGuess === normalizedWord;

      // Update game state
      const updatedGuesses = [...session.guesses, guess];
      const guessesUsed = updatedGuesses.length;
      const gameOver = isCorrect || guessesUsed >= 6;

      // Get next hint if needed
      let nextHint = null;
      if (!gameOver && !isCorrect) {
        try {
          nextHint = await this.getNextHint(session);
        } catch (error) {
          console.error('Failed to get next hint:', error);
        }
      }

      // Update session in database
      const { error: updateError } = await this.client
        .from('game_sessions')
        .update({
          guesses: updatedGuesses,
          guesses_used: guessesUsed,
          is_complete: gameOver,
          is_won: isCorrect,
          end_time: gameOver ? new Date().toISOString() : null,
          revealed_clues: nextHint ? [...session.revealed_clues, nextHint.type] : session.revealed_clues
        })
        .eq('id', gameId);

      if (updateError) {
        console.error('Error updating game session:', {
          error: updateError,
          gameId,
          isCorrect,
          gameOver
        });
        throw updateError;
      }

      // Log final result
      console.log('Final guess result:', {
        gameId,
        isCorrect,
        gameOver,
        guessesUsed,
        remainingGuesses: 6 - guessesUsed,
        nextHintType: nextHint?.type
      });

      return {
        isCorrect,
        guess,
        gameOver,
        correctWord: gameOver ? canonicalWord : undefined,
        ...(nextHint ? {
          nextHint: {
            type: nextHint.type,
            hint: nextHint.hint
          }
        } : {})
      };
    } catch (error) {
      console.error('Error in processGuess:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        gameId,
        guess
      });
      throw new Error('Failed to process guess');
    }
  }

  // Stats operations
  async getUserStats(username: string): Promise<UserStats | null> {
    try {
      const { data, error } = await this.client
        .from('user_stats')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserStats;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  }

  async updateUserStats(
    username: string,
    won: boolean,
    guessesUsed: number,
    timeTaken: number
  ): Promise<void> {
    try {
      const { data: currentStats } = await this.client
        .from('user_stats')
        .select('*')
        .eq('username', username)
        .single();

      const newStats: UserStats = {
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
    } catch (error) {
      console.error('Error in updateUserStats:', error);
      throw error;
    }
  }

  // Game operations
  async getGameSession(gameId: string): Promise<GameSession | null> {
    try {
      console.log('Fetching game session with word data:', { gameId });

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
      } as GameSessionData;

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

      console.log('Retrieved game session:', {
        gameId,
        wordId: session.word_id,
        hasCanonicalWord: !!session.words?.word
      });

      const gameSession: GameSession = {
        ...session,
        words: session.words,
        word: session.words?.word || session.word,
        state: session.is_complete ? 'completed' : 'active'
      };

      return gameSession;
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
      const dailyWord = await this.getDailyWord();
      if (!dailyWord) throw new Error('No daily word available');

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

      const initialClueStatus: ClueStatus = {
        D: 'neutral',  // Definition is shown at start
        E: 'grey',     // Etymology
        F: 'grey',     // First Letter
        I: 'grey',     // In a Sentence
        N: 'grey',     // Number of Letters
        E2: 'grey'     // Equivalents
      };

      const session: GameSession = {
        id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
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
        .select('*, words:word_id(*)')  // Join with words table to ensure word exists
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
        canonicalWord: data.words?.word,
        match: data.word === data.words?.word
      });

      return data;
    } catch (error) {
      console.error('Error in startGame:', error);
      throw error;
    }
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<string | number | null> {
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
        case 'N': return data.number_of_letters;
        case 'E2': return data.equivalents;
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

  // User operations
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

      return data as User;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return null;
    }
  }

  async createUser(username: string): Promise<User> {
    try {
      const user: User = {
        id: crypto.randomUUID(),
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

  async getNextHint(session: GameSession): Promise<{ hint: string; type: ClueType }> {
    const word = await this.client
      .from('words')
      .select('*')
      .eq('id', session.word_id)
      .single();

    if (!word.data) throw new Error('Word not found');

    const hintOrder: ClueType[] = ['D', 'E', 'F', 'I', 'N', 'E2'];
    const nextHintType = hintOrder.find(type => !session.revealed_clues.includes(type));

    if (!nextHintType) {
      throw new Error('All hints have been revealed');
    }

    let hint: string;
    switch (nextHintType) {
      case 'D': hint = word.data.definition; break;
      case 'E': hint = word.data.etymology; break;
      case 'F': hint = word.data.first_letter; break;
      case 'I': hint = word.data.in_a_sentence; break;
      case 'N': hint = word.data.number_of_letters.toString(); break;
      case 'E2': hint = word.data.equivalents; break;
      default: throw new Error('Invalid hint type');
    }

    // Update session with new revealed clue
    await this.client
      .from('game_sessions')
      .update({
        revealed_clues: [...session.revealed_clues, nextHintType]
      })
      .eq('id', session.id);

    return { hint, type: nextHintType };
  }

  async submitScore(score: {
    playerId: string;
    word: string;
    guessesUsed: number;
    usedHint: boolean;
    completionTime: number;
    nickname?: string;
  }): Promise<void> {
    const { data: existingStats } = await this.client
      .from('user_stats')
      .select('*')
      .eq('player_id', score.playerId)
      .single();

    // Insert score
    await this.client
      .from('scores')
      .insert({
        player_id: score.playerId,
        nickname: score.nickname,
        word: score.word,
        guesses_used: score.guessesUsed,
        used_hint: score.usedHint,
        completion_time_seconds: score.completionTime
      });

    // Update user stats
    const { data: scores } = await this.client
      .from('scores')
      .select('*')
      .eq('player_id', score.playerId)
      .order('completion_time_seconds', { ascending: true })
      .limit(1);

    const bestTime = scores?.[0]?.completion_time_seconds;

    await this.client
      .from('user_stats')
      .upsert({
        player_id: score.playerId,
        best_rank: existingStats?.best_rank || null,
        current_streak: (existingStats?.current_streak || 0) + 1,
        longest_streak: Math.max((existingStats?.longest_streak || 0), (existingStats?.current_streak || 0) + 1),
        average_completion_time: existingStats 
          ? ((existingStats.average_completion_time * (existingStats.current_streak || 0)) + score.completionTime) / ((existingStats.current_streak || 0) + 1)
          : score.completionTime,
        last_played_word: score.word
      });
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
} 