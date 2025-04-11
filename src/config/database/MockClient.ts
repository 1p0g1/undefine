import { 
  DatabaseClient, 
  Word, 
  LeaderboardEntry, 
  UserStats, 
  DailyLeaderboardResponse,
  DailyMetrics,
  User,
  UserCredentials,
  AuthResult,
  StreakLeader,
  GameSession,
  ClueStatus,
  GuessResult
} from './types.js';

/**
 * MockClient - A database client that returns pre-defined responses
 * for testing and development purposes.
 */
export class MockClient implements DatabaseClient {
  private connected = false;
  private words: Word[] = [
    {
      wordId: '1',
      word: 'disseminate',
      definition: 'To spread or disperse something, especially information, widely.',
      etymology: 'From Latin disseminare meaning to scatter.',
      first_letter: 'd',
      in_a_sentence: 'The internet allows users to disseminate ideas instantly.',
      number_of_letters: 11,
      equivalents: 'spread, distribute, circulate',
      difficulty: 'medium',
      timesUsed: 0,
      lastUsedAt: null,
      partOfSpeech: 'verb',
      dateAdded: '2024-03-20',
      createdAt: '2024-03-20T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z'
    },
    {
      wordId: '2',
      word: 'define',
      definition: 'State or describe exactly the nature, scope, or meaning of',
      etymology: 'From Latin definire',
      firstLetter: 'd',
      exampleSentence: 'Let me define what I mean by success.',
      numLetters: 6,
      synonyms: ['explain', 'describe', 'specify'],
      difficulty: 'easy',
      timesUsed: 0,
      lastUsedAt: null,
      partOfSpeech: 'verb',
      dateAdded: '2024-03-21',
      letterCount: {
        count: 6,
        display: '6 letters'
      },
      createdAt: '2024-03-21T00:00:00Z',
      updatedAt: '2024-03-21T00:00:00Z'
    },
    {
      wordId: '3',
      word: 'reverse',
      definition: 'Move backward in direction or position; change to the opposite',
      etymology: 'From Latin reversus',
      firstLetter: 'r',
      exampleSentence: 'The car began to reverse out of the driveway.',
      numLetters: 7,
      synonyms: ['backward', 'opposite', 'inverse'],
      difficulty: 'easy',
      timesUsed: 0,
      lastUsedAt: null,
      partOfSpeech: 'verb',
      dateAdded: '2024-03-22',
      letterCount: {
        count: 7,
        display: '7 letters'
      },
      createdAt: '2024-03-22T00:00:00Z',
      updatedAt: '2024-03-22T00:00:00Z'
    }
  ];

  private leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      username: 'testuser',
      wordId: '1',
      word: 'undefine',
      timeTaken: 120,
      guessesUsed: 4,
      fuzzyMatches: 2,
      hintsUsed: 1,
      createdAt: '2024-03-20T00:00:00Z'
    }
  ];

  private userStats: Record<string, UserStats> = {
    'testuser': {
      username: 'testuser',
      gamesPlayed: 10,
      gamesWon: 8,
      averageGuesses: 4.5,
      averageTime: 120,
      bestTime: 60,
      currentStreak: 3,
      longestStreak: 5,
      topTenCount: 2,
      lastPlayedAt: new Date().toISOString()
    }
  };

  private mockDailyMetrics: DailyMetrics = {
    date: new Date().toISOString().split('T')[0],
    totalPlays: 100,
    uniqueUsers: 50,
    averageGuesses: 4.5,
    averageTime: 120
  };

  private gameSessions: Record<string, GameSession> = {};

  // Connection methods
  async connect(): Promise<void> {
    console.log('MockClient: Connected to mock database');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    console.log('MockClient: Disconnected from mock database');
    this.connected = false;
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
    return this.words.find(w => w.wordId === wordId) || null;
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    const newWord: Word = {
      ...word,
      wordId: (this.words.length + 1).toString(),
      timesUsed: 0,
      lastUsedAt: null,
      firstLetter: word.word[0],
      numLetters: word.word.length
    };
    this.words.push(newWord);
    return newWord;
  }

  async updateWord(wordId: string, word: Partial<Word>): Promise<Word> {
    const index = this.words.findIndex(w => w.wordId === wordId);
    if (index === -1) throw new Error('Word not found');
    this.words[index] = { ...this.words[index], ...word };
    return this.words[index];
  }

  async deleteWord(wordId: string): Promise<boolean> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    const initialLength = this.words.length;
    this.words = this.words.filter(word => word.wordId !== wordId);
    return this.words.length < initialLength;
  }

  async searchWords(query: string): Promise<Word[]> {
    return this.words.filter(w => 
      w.word.toLowerCase().includes(query.toLowerCase()) ||
      w.definition.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getRandomWord(): Promise<Word> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex];
  }

  async getDailyWord(): Promise<Word> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    // For mock purposes, just return the first word
    return this.words[0];
  }

  async setDailyWord(wordId: string, date: string): Promise<void> {
    // No-op for mock
  }

  async getNextUnusedWord(): Promise<Word | null> {
    return this.words.find(w => !w.timesUsed) || null;
  }

  async markAsUsed(wordId: string): Promise<void> {
    const word = this.words.find(w => w.wordId === wordId);
    if (word) {
      word.timesUsed++;
      word.lastUsedAt = new Date();
    }
  }

  // User management
  async authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        success: true,
        token: 'mock-token'
      };
    }
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return {
      id: 'user1',
      email,
      username: 'user1',
      createdAt: new Date().toISOString()
    };
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
  async updateUserStats(username: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    // In a real implementation, this would update the user's stats
    // For mock purposes, we'll just return void
  }

  async getDailyStats(): Promise<DailyMetrics> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return {
      date: new Date().toISOString().split('T')[0],
      totalPlays: this.leaderboard.length,
      uniqueUsers: new Set(this.leaderboard.map(e => e.username)).size,
      averageGuesses: this.leaderboard.reduce((acc, e) => acc + e.guessesUsed, 0) / this.leaderboard.length || 0,
      averageTime: this.leaderboard.reduce((acc, e) => acc + e.timeTaken, 0) / this.leaderboard.length || 0
    };
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    return {
      totalGames: this.leaderboard.length,
      averageTime: this.leaderboard.reduce((acc, e) => acc + e.timeTaken, 0) / this.leaderboard.length,
      averageGuesses: this.leaderboard.reduce((acc, e) => acc + e.guessesUsed, 0) / this.leaderboard.length,
      uniquePlayers: new Set(this.leaderboard.map(e => e.username)).size,
      completionRate: 0.8
    };
  }

  async getTopStreaks(limit: number = 10): Promise<StreakLeader[]> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return Object.values(this.userStats)
      .map(stats => ({
        username: stats.username,
        streak: stats.currentStreak,
        lastPlayedAt: stats.lastPlayedAt
      }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, limit);
  }

  async updateLastLogin(username: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    // In a real implementation, this would update the user's last login time
    // For mock purposes, we'll just return void
  }

  async startGame(): Promise<GameSession> {
    const word = await this.getDailyWord();
    const gameId = Math.random().toString(36).substring(2, 15);
    
    const session: GameSession = {
      id: gameId,
      word_id: word.wordId,
      word: word.word,
      start_time: new Date().toISOString(),
      guesses: [],
      guesses_used: 0,
      revealed_clues: ['D'],
      clue_status: {
        D: 'neutral',
        E: 'grey',
        F: 'grey',
        I: 'grey',
        N: 'grey',
        E2: 'grey'
      },
      is_complete: false,
      is_won: false
    };

    this.gameSessions[gameId] = session;
    return session;
  }

  async processGuess(
    gameId: string,
    guess: string,
    session: GameSession
  ): Promise<GuessResult> {
    // Case-insensitive comparison
    const isCorrect = guess.toLowerCase() === session.word.toLowerCase();
    const gameOver = isCorrect || session.guesses.length >= 5;
    
    // Update session with proper state
    const updatedSession = {
      ...session,
      guesses: [...session.guesses, guess],
      guesses_used: session.guesses.length + 1,
      is_complete: gameOver,
      is_won: isCorrect,
      end_time: gameOver ? new Date().toISOString() : undefined,
      // Update clue status
      clue_status: {
        ...session.clue_status,
        [String.fromCharCode(68 + session.guesses.length)]: isCorrect ? 'green' : 'red'
      }
    };
    
    this.gameSessions[gameId] = updatedSession;

    // Calculate fuzzy match
    const isFuzzy = !isCorrect && this.calculateFuzzyMatch(guess, session.word);
    const fuzzyPositions = isFuzzy ? this.getFuzzyPositions(guess, session.word) : [];

    return {
      isCorrect,
      correctWord: session.word,
      guessedWord: guess,
      isFuzzy,
      fuzzyPositions,
      gameOver,
      updatedSession,
      leaderboardRank: isCorrect ? 1 : null
    };
  }

  private calculateFuzzyMatch(guess: string, word: string): boolean {
    // Simple fuzzy match: allow one character difference
    if (Math.abs(guess.length - word.length) > 1) return false;
    
    let differences = 0;
    const maxLength = Math.max(guess.length, word.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (guess[i]?.toLowerCase() !== word[i]?.toLowerCase()) {
        differences++;
        if (differences > 1) return false;
      }
    }
    
    return differences === 1;
  }

  private getFuzzyPositions(guess: string, word: string): number[] {
    const positions: number[] = [];
    const maxLength = Math.max(guess.length, word.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (guess[i]?.toLowerCase() !== word[i]?.toLowerCase()) {
        positions.push(i);
      }
    }
    
    return positions;
  }

  async getGameSession(gameId: string): Promise<GameSession | null> {
    return this.gameSessions[gameId] || null;
  }

  async checkGuess(wordId: string, guess: string): Promise<boolean> {
    const word = await this.getWord(wordId);
    return word ? word.word.toLowerCase() === guess.toLowerCase() : false;
  }
} 