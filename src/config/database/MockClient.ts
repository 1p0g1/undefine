import { 
  ClueStatus,
  ClueType,
  DatabaseClient, 
  GameSession,
  GameState,
  GuessResult,
  User,
  UserStats,
  Word,
  Result
} from '../../../packages/shared-types/src/index.js';

// Create additional types locally to fix errors
interface DailyMetrics {
  totalGames: number;
  averageTime: number;
  averageGuesses: number;
  uniquePlayers: number;
  completionRate: number;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  wordId: string;
  word: string;
  timeTaken: number;
  guessesUsed: number;
  fuzzyMatches: number;
  hintsUsed: number;
  createdAt: string;
}

interface StreakLeader {
  username: string;
  streak: number;
  lastPlayedAt: string;
}

interface DailyLeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank: number;
}

/**
 * MockClient - A database client that returns pre-defined responses
 * for testing and development purposes.
 */
export class MockClient implements DatabaseClient {
  private connected = false;
  private words: Word[] = [];
  private gameSessions: Record<string, GameSession> = {};
  private leaderboard: LeaderboardEntry[] = [];
  private dailyMetrics: DailyMetrics = {
    totalGames: 0,
    averageTime: 0,
    averageGuesses: 0,
    uniquePlayers: 0,
    completionRate: 0
  };
  private streakLeaders: StreakLeader[] = [];
  private users: Record<string, User> = {};

  constructor() {
    this.leaderboard = [];
    this.streakLeaders = [];
  }

  // Connection methods
  async connect(): Promise<Result<void>> {
    console.log('MockClient: Connecting to mock database');
    
    try {
      // Initialize mock data
      this.words = [
        {
          id: '1',
          word: 'define',
          definition: 'To state or describe exactly the nature, scope, or meaning of something',
          etymology: 'From Latin "definire", meaning "to limit, determine, explain"',
          first_letter: 'd',
          in_a_sentence: 'Can you define what success means to you?',
          number_of_letters: 6,
          equivalents: ['explain', 'specify', 'establish', 'determine'],
          difficulty: 'Easy',
          times_used: 0,
          last_used_at: null
        },
        {
          id: '2',
          word: 'undefine',
          definition: 'To remove or eliminate the definition or limits of something',
          etymology: 'Combination of prefix "un-" (meaning not or reverse) and "define"',
          first_letter: 'u',
          in_a_sentence: 'The artist sought to undefine traditional boundaries in art.',
          number_of_letters: 8,
          equivalents: ['remove limits', 'broaden', 'expand'],
          difficulty: 'Medium',
          times_used: 0,
          last_used_at: null
        }
      ];

      this.connected = true;
      console.log('MockClient: Connected successfully');
      return { success: true, data: undefined };
    } catch (error) {
      console.error('MockClient: Failed to connect:', error);
      return { 
        success: false, 
        error: { 
          code: 'CONNECTION_ERROR',
          message: 'Failed to connect to mock database',
          details: error
        }
      };
    }
  }

  async disconnect(): Promise<Result<void>> {
    console.log('MockClient: Disconnecting from mock database');
    this.connected = false;
    return { success: true, data: undefined };
  }

  async initializeDatabase(): Promise<void> {
    console.log('MockClient: Database initialized');
  }

  async setupTables(): Promise<void> {
    console.log('MockClient: Tables set up');
  }

  // Word management
  async getWords(): Promise<Result<Word[]>> {
    return { success: true, data: this.words };
  }

  async getWord(wordId: string): Promise<Result<Word | null>> {
    return { success: true, data: this.words.find(w => w.id === wordId) || null };
  }

  async addWord(word: Omit<Word, 'id'>): Promise<Result<Word>> {
    const newWord: Word = {
      ...word,
      id: (this.words.length + 1).toString(),
      times_used: 0,
      last_used_at: null,
      first_letter: word.word[0],
      number_of_letters: word.word.length
    };
    this.words.push(newWord);
    return { success: true, data: newWord };
  }

  async updateWord(wordId: string, word: Partial<Word>): Promise<Result<Word>> {
    const existingWord = this.words.find(w => w.id === wordId);
    if (!existingWord) {
      return { 
        success: false, 
        error: { 
          code: 'WORD_NOT_FOUND',
          message: 'Word not found'
        }
      };
    }
    const updatedWord: Word = {
      ...existingWord,
      ...word
    };
    return { success: true, data: updatedWord };
  }

  async deleteWord(wordId: string): Promise<Result<boolean>> {
    if (!this.connected) {
      return {
        success: false,
        error: {
          code: 'NOT_CONNECTED',
          message: 'Database not connected'
        }
      };
    }
    const initialLength = this.words.length;
    this.words = this.words.filter(w => w.id !== wordId);
    return { success: true, data: this.words.length < initialLength };
  }

  async searchWords(query: string): Promise<Result<Word[]>> {
    return { 
      success: true, 
      data: this.words.filter(w => 
        w.word.toLowerCase().includes(query.toLowerCase()) ||
        w.definition.toLowerCase().includes(query.toLowerCase())
      )
    };
  }

  async getRandomWord(): Promise<Result<Word>> {
    if (!this.connected) {
      return {
        success: false,
        error: {
          code: 'NOT_CONNECTED',
          message: 'Database not connected'
        }
      };
    }
    
    if (this.words.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_WORDS',
          message: 'No words available in database'
        }
      };
    }

    const randomIndex = Math.floor(Math.random() * this.words.length);
    return { success: true, data: this.words[randomIndex] };
  }

  async getDailyWord(date?: string): Promise<Result<Word>> {
    if (!this.connected) {
      return {
        success: false,
        error: {
          code: 'NOT_CONNECTED',
          message: 'Database not connected'
        }
      };
    }

    if (this.words.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_WORDS',
          message: 'No words available in database'
        }
      };
    }

    // Get a random word for development, first word for production
    const word = process.env.NODE_ENV === 'development' 
      ? this.words[Math.floor(Math.random() * this.words.length)]
      : this.words[0];

    return { success: true, data: word };
  }

  async setDailyWord(wordId: string, date: string): Promise<void> {
    // No-op for mock
  }

  async getNextUnusedWord(): Promise<Result<Word | null>> {
    return { success: true, data: this.words.find(w => !w.times_used) || null };
  }

  async markAsUsed(wordId: string): Promise<Result<void>> {
    const word = this.words.find(w => w.id === wordId);
    if (word) {
      word.times_used = (word.times_used || 0) + 1;
      word.last_used_at = new Date().toISOString();
    }
    return { success: true, data: undefined };
  }

  // User management
  async getUserByEmail(email: string): Promise<Result<User | null>> {
    return { success: true, data: this.users[email] || null };
  }

  async getUserByUsername(username: string): Promise<Result<User | null>> {
    const user = this.users[username] || null;
    return { success: true, data: user };
  }

  async createUser(username: string): Promise<Result<User>> {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      username,
      created_at: new Date().toISOString()
    };
    this.users[username] = user;
    return { success: true, data: user };
  }

  // Leaderboard management
  async addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<LeaderboardEntry> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    return newEntry;
  }

  async getDailyLeaderboard(): Promise<DailyLeaderboardResponse> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return {
      entries: [],
      userRank: 0
    };
  }

  async getLeaderboardRank(gameId: string): Promise<number | null> {
    const index = this.leaderboard.findIndex(e => e.id === gameId);
    return index === -1 ? null : index + 1;
  }

  // Stats management
  async getUserStats(username: string): Promise<Result<UserStats | null>> {
    const stats = {
      username,
      games_played: 10,
      games_won: 7,
      average_guesses: 4.2,
      average_time: 120,
      current_streak: 3,
      longest_streak: 5,
      last_played_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { success: true, data: stats };
  }

  async updateUserStats(
    username: string,
    won: boolean,
    guessesUsed: number,
    timeTaken: number
  ): Promise<Result<void>> {
    // Mock implementation - just return success
    return { success: true, data: undefined };
  }

  async getDailyStats(): Promise<DailyMetrics> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return {
      totalGames: this.leaderboard.length,
      uniquePlayers: new Set(this.leaderboard.map(e => e.username)).size,
      averageGuesses: this.leaderboard.reduce((acc, e) => acc + e.guessesUsed, 0) / this.leaderboard.length || 0,
      averageTime: this.leaderboard.reduce((acc, e) => acc + e.timeTaken, 0) / this.leaderboard.length || 0,
      completionRate: (this.leaderboard.filter(e => e.guessesUsed > 0).length / this.leaderboard.length) * 100 || 0
    };
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    return this.dailyMetrics;
  }

  async getTopStreaks(): Promise<StreakLeader[]> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    
    // Sort streakLeaders by streak in descending order
    return this.streakLeaders.map(leader => ({
      username: leader.username,
      streak: leader.streak,
      lastPlayedAt: leader.lastPlayedAt || new Date().toISOString()
    }));
  }

  async updateLastLogin(username: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    // In a real implementation, this would update the user's last login time
    // For mock purposes, we'll just return void
  }

  // Helper function for text normalization
  private normalize(text: string | null | undefined): string {
    if (!text) return '';
    return text.trim().toLowerCase().replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  }

  async processGuess(
    gameId: string,
    guess: string,
    session: GameSession
  ): Promise<Result<GuessResult>> {
    const result: GuessResult = {
      isCorrect: guess === session.word,
      guess,
      gameOver: false,
      correctWord: session.word,
      nextHint: {
        type: 'D',
        hint: 'A mock hint'
      }
    };
    return { success: true, data: result };
  }

  async startGame(): Promise<Result<GameSession>> {
    const word = await this.getRandomWord();
    if (!word.success || !word.data) {
      return {
        success: false,
        error: word.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Failed to get random word'
        }
      };
    }

    const session: GameSession = {
      id: Math.random().toString(36).substring(7),
      word_id: word.data.id,
      word: word.data.word,
      start_time: new Date().toISOString(),
      guesses: [],
      guesses_used: 0,
      revealed_clues: [],
      clue_status: {
        D: 'neutral',
        E: 'neutral',
        F: 'neutral',
        I: 'neutral',
        N: 'neutral',
        E2: 'neutral'
      },
      is_complete: false,
      is_won: false,
      state: 'active'
    };

    this.gameSessions[session.id] = session;
    return { success: true, data: session };
  }

  async getGameSession(gameId: string): Promise<Result<GameSession | null>> {
    const session = this.gameSessions[gameId] || null;
    return { success: true, data: session };
  }

  async checkGuess(wordId: string, guess: string): Promise<boolean> {
    const word = this.words.find(w => w.id === wordId);
    if (!word) return false;
    return this.normalize(guess) === this.normalize(word.word);
  }

  async createGameSession(wordId: string, word: string): Promise<GameSession> {
    const gameId = Math.random().toString(36).substr(2, 9);
    
    // Create empty clue status
    const clue_status: ClueStatus = {
      D: 'neutral',
      E2: 'neutral',
      F: 'neutral',
      I: 'neutral',
      N: 'neutral',
      E: 'neutral'
    };
    
    const session: GameSession = {
      id: gameId,
      word_id: wordId,
      word,
      start_time: new Date().toISOString(),
      guesses: [],
      guesses_used: 0,
      revealed_clues: [],
      clue_status: clue_status,
      is_complete: false,
      is_won: false,
      state: 'active'
    };
    
    this.gameSessions[gameId] = session;
    return session;
  }

  async endGame(gameId: string, won: boolean): Promise<Result<void>> {
    const session = this.gameSessions[gameId];
    if (session) {
      session.is_complete = true;
      session.is_won = won;
      session.end_time = new Date().toISOString();
      session.state = 'completed';
    }
    return { success: true, data: undefined };
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<Result<string | number | null>> {
    const word = this.words.find(w => w.id === session.word_id);
    if (!word) {
      return {
        success: false,
        error: {
          code: 'WORD_NOT_FOUND',
          message: 'Word not found'
        }
      };
    }

    let clue: string | number | null = null;
    switch (clueType) {
      case 'D':
        clue = word.definition;
        break;
      case 'E':
        clue = word.etymology || null;
        break;
      case 'F':
        clue = word.first_letter;
        break;
      case 'I':
        clue = word.in_a_sentence || null;
        break;
      case 'N':
        clue = word.number_of_letters;
        break;
      case 'E2':
        clue = word.equivalents.join(', ');
        break;
    }

    return { success: true, data: clue };
  }

  async getNextHint(session: GameSession): Promise<Result<{ hint: string; type: ClueType }>> {
    const availableClues: ClueType[] = ['D', 'E', 'F', 'I', 'N', 'E2'].filter(
      clue => !session.revealed_clues.includes(clue as ClueType)
    ) as ClueType[];

    if (availableClues.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_HINTS',
          message: 'No more hints available'
        }
      };
    }

    const nextClueType = availableClues[0];
    const clueResult = await this.getClue(session, nextClueType);

    if (!clueResult.success || !clueResult.data) {
      return {
        success: false,
        error: clueResult.error || {
          code: 'HINT_ERROR',
          message: 'Failed to get hint'
        }
      };
    }

    return {
      success: true,
      data: {
        hint: String(clueResult.data),
        type: nextClueType
      }
    };
  }

  async submitScore(score: {
    playerId: string;
    word: string;
    guessesUsed: number;
    usedHint: boolean;
    completionTime: number;
    nickname?: string;
  }): Promise<Result<void>> {
    // Mock implementation - just return success
    return { success: true, data: undefined };
  }
} 