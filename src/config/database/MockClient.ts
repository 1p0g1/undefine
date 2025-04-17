import { 
  DatabaseClient, 
  Word, 
  LeaderboardEntry, 
  UserStats, 
  DailyLeaderboardResponse,
  DailyMetrics,
  User,
  StreakLeader,
  GameSession,
  GuessResult,
  ClueType,
  ClueStatus
} from '@shared/types';

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
  async connect(): Promise<void> {
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
          equivalents: 'explain, specify, establish, determine',
          difficulty: 'Easy',
          timesUsed: 0,
          lastUsedAt: null
        },
        {
          id: '2',
          word: 'undefine',
          definition: 'To remove or eliminate the definition or limits of something',
          etymology: 'Combination of prefix "un-" (meaning not or reverse) and "define"',
          first_letter: 'u',
          in_a_sentence: 'The artist sought to undefine traditional boundaries in art.',
          number_of_letters: 8,
          equivalents: 'remove limits, broaden, expand',
          difficulty: 'Medium',
          timesUsed: 0,
          lastUsedAt: null
        }
      ];

      this.connected = true;
      console.log('MockClient: Connected successfully');
    } catch (error) {
      console.error('MockClient: Failed to connect:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('MockClient: Disconnecting from mock database');
    this.connected = false;
    return Promise.resolve();
  }

  async initializeDatabase(): Promise<void> {
    console.log('MockClient: Database initialized');
  }

  async setupTables(): Promise<void> {
    console.log('MockClient: Tables set up');
  }

  // Word management
  async getWords(): Promise<Word[]> {
    return this.words;
  }

  async getWord(wordId: string): Promise<Word | null> {
    return this.words.find(w => w.id === wordId) || null;
  }

  async addWord(word: Omit<Word, 'id'>): Promise<Word> {
    const newWord: Word = {
      ...word,
      id: (this.words.length + 1).toString(),
      timesUsed: 0,
      lastUsedAt: null,
      first_letter: word.word[0],
      number_of_letters: word.word.length
    };
    this.words.push(newWord);
    return newWord;
  }

  async updateWord(wordId: string, word: Partial<Word>): Promise<Word> {
    const existingWord = this.words.find(w => w.id === wordId);
    if (!existingWord) throw new Error('Word not found');
    const updatedWord: Word = {
      ...existingWord,
      ...word
    };
    return updatedWord;
  }

  async deleteWord(wordId: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    const initialLength = this.words.length;
    this.words = this.words.filter(w => w.id !== wordId);
    return this.words.length < initialLength;
  }

  async searchWords(query: string): Promise<Word[]> {
    return this.words.filter(w => 
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.definition.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getRandomWord(): Promise<Word> {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex];
  }

  async getDailyWord(date?: string): Promise<Word> {
    if (this.words.length === 0) {
      console.error('No words available in database');
      throw new Error('No words available in database');
    }

    // Get a random word for development, first word for production
    const word = process.env.NODE_ENV === 'development' 
      ? this.words[Math.floor(Math.random() * this.words.length)]
      : this.words[0];

    if (!word) {
      console.error('Failed to get word from database');
      throw new Error('Failed to get word from database');
    }

    console.log('Retrieved word from database:', {
      id: word.id,
      length: word.word.length,
      hasDefinition: !!word.definition
    });

    return word;
  }

  async setDailyWord(wordId: string, date: string): Promise<void> {
    // No-op for mock
  }

  async getNextUnusedWord(): Promise<Word | null> {
    return this.words.find(w => !w.timesUsed) || null;
  }

  async markAsUsed(wordId: string): Promise<void> {
    const word = this.words.find(w => w.id === wordId);
    if (word) {
      word.timesUsed = (word.timesUsed || 0) + 1;
      word.lastUsedAt = new Date().toISOString();
    }
  }

  // User management
  async getUserByEmail(email: string): Promise<User | null> {
    return this.users[email] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users[username] || null;
  }

  async createUser(username: string): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      username,
      created_at: new Date().toISOString()
    };
    this.users[username] = user;
    return user;
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
  async getUserStats(username: string): Promise<UserStats | null> {
    return {
      username,
      games_played: 0,
      games_won: 0,
      average_guesses: 0,
      average_time: 0,
      current_streak: 0,
      longest_streak: 0,
      last_played_at: new Date().toISOString()
    };
  }

  async updateUserStats(
    username: string,
    won: boolean,
    guessesUsed: number,
    timeTaken: number
  ): Promise<void> {
    // Mock implementation - no need to store stats
    return Promise.resolve();
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
    return this.streakLeaders.map(leader => ({
      username: leader.username,
      streak: leader.streak,
      lastPlayed: leader.lastPlayed
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
  ): Promise<GuessResult> {
    // Normalize both guess and word to ensure consistent comparison
    const normalizedGuess = this.normalize(guess);
    const normalizedWord = this.normalize(session.word);
    
    // Check for exact match
    const isCorrect = normalizedGuess === normalizedWord;
    const gameOver = isCorrect || session.guesses.length >= 5;
    
    // Update session with original guess (not normalized)
    const updatedSession = {
      ...session,
      guesses: [...session.guesses, guess],
      isComplete: gameOver,
      isWon: isCorrect,
      end_time: gameOver ? new Date().toISOString() : undefined
    };
    this.gameSessions[gameId] = updatedSession;

    // Only calculate fuzzy match if not correct
    const isFuzzy = !isCorrect && this.calculateFuzzyMatch(normalizedGuess, normalizedWord);
    const fuzzyPositions = isFuzzy ? this.getFuzzyPositions(normalizedGuess, normalizedWord) : [];

    return {
      isCorrect,
      guess: normalizedGuess,
      isFuzzy,
      fuzzyPositions,
      gameOver,
      correctWord: gameOver ? session.word : undefined
    };
  }

  private calculateFuzzyMatch(guess: string, word: string): boolean {
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedWord = word.toLowerCase().trim();
    
    let matches = 0;
    for (let i = 0; i < normalizedGuess.length; i++) {
      if (normalizedGuess[i] === normalizedWord[i]) matches++;
    }
    
    return matches >= Math.floor(word.length * 0.8);
  }

  private getFuzzyPositions(guess: string, word: string): number[] {
    const positions: number[] = [];
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedWord = word.toLowerCase().trim();
    
    for (let i = 0; i < normalizedGuess.length; i++) {
      if (normalizedGuess[i] === normalizedWord[i]) {
        positions.push(i);
      }
    }
    
    return positions;
  }

  async startGame(): Promise<GameSession> {
    const word = await this.getDailyWord();
    const gameId = crypto.randomUUID();
    
    console.log('Starting new game session:', {
      gameId,
      wordId: word.id,
      wordLength: word.word.length
    });

    const session: GameSession = {
      id: gameId,
      word_id: word.id,
      word: word.word,
      start_time: new Date().toISOString(),
      guesses: [],
      guesses_used: 0,
      revealed_clues: [],
      clue_status: {},
      is_complete: false,
      is_won: false
    };

    this.gameSessions[gameId] = session;
    
    console.log('Game session created:', {
      gameId: session.id,
      hasWord: !!session.word,
      startTime: session.start_time
    });

    return session;
  }

  async getGameSession(gameId: string): Promise<GameSession | null> {
    return this.gameSessions[gameId] || null;
  }

  async checkGuess(wordId: string, guess: string): Promise<boolean> {
    const word = this.words.find(w => w.id === wordId);
    if (!word) return false;
    return this.normalize(guess) === this.normalize(word.word);
  }

  async createGameSession(wordId: string, word: string): Promise<GameSession> {
    const session: GameSession = {
      id: crypto.randomUUID(),
      word_id: wordId,
      word: word,
      guesses: [],
      guesses_used: 0,
      revealed_clues: [],
      clue_status: {},
      is_complete: false,
      is_won: false,
      start_time: new Date().toISOString()
    };
    return session;
  }

  async endGame(gameId: string, won: boolean): Promise<void> {
    const session = this.gameSessions[gameId];
    if (session) {
      session.is_complete = true;
      session.is_won = won;
      session.end_time = new Date().toISOString();
    }
  }

  async getClue(session: GameSession, clueType: ClueType): Promise<string | number | null> {
    const word = this.words.find(w => w.id === session.word_id);
    if (!word) return null;

    switch (clueType) {
      case 'D': return word.definition;
      case 'E': return word.etymology;
      case 'F': return word.first_letter;
      case 'I': return word.in_a_sentence;
      case 'N': return word.number_of_letters;
      case 'E2': return word.equivalents;
      default: return null;
    }
  }
} 