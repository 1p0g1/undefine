import { 
  DatabaseClient, 
  Word, 
  LeaderboardEntry, 
  UserStats, 
  DailyLeaderboardResponse, 
  DailyStatsResponse, 
  DailyMetrics, 
  StreakLeader,
  GameMetric,
  FuzzyGuessMetrics,
  PlayerPerformanceMetrics
} from '../../config/database/index.js';

/**
 * MockClient - A database client that returns pre-defined responses
 * for testing and development purposes.
 */
export class MockClient implements DatabaseClient {
  private connected = false;
  private words: Word[] = [
    {
      wordId: '1',
      word: 'undefine',
      definition: 'The act of removing a definition or making something undefined',
      partOfSpeech: 'verb'
    },
    {
      wordId: '2',
      word: 'define',
      definition: 'State or describe exactly the nature, scope, or meaning of',
      partOfSpeech: 'verb'
    },
    {
      wordId: '3',
      word: 'reverse',
      definition: 'Move backward in direction or position; change to the opposite',
      partOfSpeech: 'verb'
    }
  ];

  private leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      username: 'smartguesser',
      word: 'undefine',
      guesses: 2,
      completion_time_seconds: 45,
      used_hint: false,
      completed: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      username: 'wordninja',
      word: 'define',
      guesses: 1,
      completion_time_seconds: 30,
      used_hint: false,
      completed: true,
      created_at: new Date().toISOString()
    }
  ];

  private userStats: Record<string, UserStats> = {
    'smartguesser': {
      games_played: 10,
      average_guesses: 2.5,
      average_time: 60,
      best_time: 30,
      current_streak: 3,
      longest_streak: 5,
      top_ten_count: 2,
      last_result: 'win',
      last_updated: new Date().toISOString()
    },
    'wordninja': {
      games_played: 15,
      average_guesses: 1.8,
      average_time: 45,
      best_time: 20,
      current_streak: 7,
      longest_streak: 7,
      top_ten_count: 5,
      last_result: 'win',
      last_updated: new Date().toISOString()
    }
  };

  // Add game metrics storage
  private gameMetrics: GameMetric[] = [];

  private static instance: MockClient;

  constructor() {
    console.log('MockClient: Initialized');
  }

  static getInstance(): MockClient {
    if (!MockClient.instance) {
      MockClient.instance = new MockClient();
    }
    return MockClient.instance;
  }

  // Connection methods
  async connect(): Promise<void> {
    console.log('MockClient: Connected to mock database');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    console.log('MockClient: Disconnected from mock database');
    this.connected = false;
  }

  // Word methods
  async getWords(): Promise<Word[]> {
    console.log('MockClient: getWords called');
    return this.words;
  }

  async getWord(id: string): Promise<Word | null> {
    console.log(`MockClient: getWord called with id: ${id}`);
    return this.words.find(word => word.wordId === id) || null;
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    console.log(`MockClient: addWord called with word: ${word.word}`);
    const newWord = { ...word, wordId: (this.words.length + 1).toString() };
    this.words.push(newWord);
    return newWord;
  }

  async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    console.log(`MockClient: updateWord called with id: ${id}`);
    const index = this.words.findIndex(w => w.wordId === id);
    if (index === -1) {
      throw new Error(`Word with ID ${id} not found`);
    }
    this.words[index] = { ...this.words[index], ...word };
    return this.words[index];
  }

  async deleteWord(id: string): Promise<void> {
    console.log(`MockClient: deleteWord called with id: ${id}`);
    const index = this.words.findIndex(w => w.wordId === id);
    if (index !== -1) {
      this.words.splice(index, 1);
    }
  }

  async searchWords(query: string): Promise<Word[]> {
    console.log(`MockClient: searchWords called with query: ${query}`);
    return this.words.filter(
      word => word.word.includes(query) || word.definition.includes(query)
    );
  }

  async getRandomWord(): Promise<Word> {
    console.log('MockClient: getRandomWord called');
    
    // In testing mode, just return a completely random word
    // In production mode, we would filter by date
    const allWords = Object.values(this.words);
    const randomIndex = Math.floor(Math.random() * allWords.length);
    const word = allWords[randomIndex];
    
    console.log(`MockClient: getRandomWord returned word "${word.word}" (${word.wordId})`);
    return word;
  }

  /**
   * Mark a word as used, incrementing its usage count and updating its last used date
   * @param wordId The ID of the word to mark as used
   */
  async markAsUsed(wordId: string): Promise<void> {
    console.log(`MockClient: markAsUsed called for wordId: ${wordId}`);
    const wordIndex = this.words.findIndex(word => word.wordId === wordId);
    if (wordIndex !== -1) {
      // In a real implementation, we would update time fields here
      console.log(`MockClient: Marked word '${this.words[wordIndex].word}' as used`);
    } else {
      console.log(`MockClient: Word with ID ${wordId} not found`);
    }
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    console.log('MockClient: getLeaderboard called');
    return this.leaderboard.sort((a, b) => a.completion_time_seconds - b.completion_time_seconds);
  }

  async getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse> {
    console.log(`MockClient: getDailyLeaderboard called for user: ${userEmail || 'anonymous'}`);
    const username = userEmail ? userEmail.split('@')[0] : '';
    const entries = this.leaderboard.sort((a, b) => a.completion_time_seconds - b.completion_time_seconds);
    const userStats = username ? this.userStats[username] : undefined;
    const userRank = username ? 
      entries.findIndex(entry => entry.username === username) + 1 : 
      undefined;

    return {
      entries,
      userStats,
      userRank
    };
  }

  async addToLeaderboard(entry: Omit<LeaderboardEntry, 'id'>): Promise<void> {
    console.log(`MockClient: addToLeaderboard called for user: ${entry.username}`);
    const newEntry = { ...entry, id: (this.leaderboard.length + 1).toString() };
    this.leaderboard.push(newEntry);
  }

  async getLeaderboardRank(gameId: string): Promise<number> {
    console.log(`MockClient: getLeaderboardRank called for gameId: ${gameId}`);
    return 1; // Mock implementation always returns rank 1
  }

  async updateUserStats(username: string): Promise<void> {
    console.log(`MockClient: updateUserStats called for user: ${username}`);
    if (!this.userStats[username]) {
      this.userStats[username] = {
        games_played: 1,
        average_guesses: 3,
        average_time: 60,
        best_time: 60,
        current_streak: 1,
        longest_streak: 1,
        top_ten_count: 0,
        last_result: 'win',
        last_updated: new Date().toISOString()
      };
    } else {
      this.userStats[username].games_played += 1;
      this.userStats[username].last_updated = new Date().toISOString();
    }
  }

  async getUserStats(username: string): Promise<UserStats> {
    console.log(`MockClient: getUserStats called for user: ${username}`);
    return this.userStats[username] || {
      games_played: 0,
      average_guesses: 0,
      average_time: 0,
      best_time: 0,
      current_streak: 0,
      longest_streak: 0,
      top_ten_count: 0,
      last_result: 'none',
      last_updated: new Date().toISOString()
    };
  }

  // Stats methods
  async getDailyStats(): Promise<DailyStatsResponse> {
    console.log('MockClient: getDailyStats called');
    const metrics: DailyMetrics = {
      total_plays: 25,
      unique_users: 10,
      avg_guesses: 2.5,
      avg_completion_time: 50
    };

    const streakLeaders: StreakLeader[] = [
      { username: 'wordninja', current_streak: 7, longest_streak: 7 },
      { username: 'smartguesser', current_streak: 3, longest_streak: 5 }
    ];

    return { metrics, streakLeaders };
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    console.log('MockClient: getTodayMetrics called');
    return {
      total_plays: 25,
      unique_users: 10,
      avg_guesses: 2.5,
      avg_completion_time: 50
    };
  }

  async getTopStreaks(limit: number = 10): Promise<StreakLeader[]> {
    console.log(`MockClient: getTopStreaks called with limit: ${limit}`);
    return [
      { username: 'wordninja', current_streak: 7, longest_streak: 7 },
      { username: 'smartguesser', current_streak: 3, longest_streak: 5 }
    ].slice(0, limit);
  }

  // Auth methods
  async authenticateUser(credentials: { email: string; password: string }): Promise<{ token: string; user: { email: string; id: string } }> {
    console.log(`MockClient: authenticateUser called with email: ${credentials.email}`);
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: credentials.email
      }
    };
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    console.log(`MockClient: getUserByEmail called with email: ${email}`);
    return {
      id: '1',
      email
    };
  }

  // Admin methods
  async getDatabaseInfo(): Promise<{ version: string; database: string; schema: string; warehouse: string; tableCount: number }> {
    console.log('MockClient: getDatabaseInfo called');
    return {
      version: 'Mock DB v1.0',
      database: 'MOCK_DB',
      schema: 'PUBLIC',
      warehouse: 'MOCK_WAREHOUSE',
      tableCount: 2
    };
  }

  async listTables(): Promise<string[]> {
    console.log('MockClient: listTables called');
    return ['WORDS', 'USERS'];
  }

  async countTableRows(tableName: string): Promise<number> {
    console.log(`MockClient: countTableRows called for table: ${tableName}`);
    switch (tableName.toUpperCase()) {
      case 'WORDS':
        return 100;
      case 'USERS':
        return 10;
      default:
        return 0;
    }
  }

  async getSampleTableData(tableName: string, limit: number = 5): Promise<Record<string, any>[]> {
    console.log(`MockClient: getSampleTableData called for table: ${tableName} with limit: ${limit}`);
    if (tableName.toUpperCase() === 'WORDS') {
      return Array(Math.min(limit, 5)).fill(0).map((_, i) => ({
        ID: `word-${i}`,
        WORD: `sampleword${i}`,
        DEFINITION: `Definition for sample word ${i}`,
        DIFFICULTY: i % 3 + 1
      }));
    }
    return [];
  }

  async describeTable(tableName: string): Promise<{ name: string; type: string }[]> {
    console.log(`MockClient: describeTable called for table: ${tableName}`);
    if (tableName.toUpperCase() === 'WORDS') {
      return [
        { name: 'ID', type: 'VARCHAR' },
        { name: 'WORD', type: 'VARCHAR' },
        { name: 'DEFINITION', type: 'VARCHAR' },
        { name: 'DIFFICULTY', type: 'NUMBER' }
      ];
    }
    return [];
  }

  // Game metrics methods
  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    console.log(`MockClient: executeQuery called with query: ${query.substring(0, 50)}...`);
    console.log(`MockClient: query params:`, params);
    return [] as T[];
  }

  async saveGameMetric(metric: GameMetric): Promise<void> {
    console.log(`MockClient: saveGameMetric called for gameId: ${metric.gameId}`);
    this.gameMetrics.push(metric);
  }

  async getFuzzyGuessMetrics(wordId: string): Promise<FuzzyGuessMetrics> {
    console.log(`MockClient: getFuzzyGuessMetrics called for wordId: ${wordId}`);
    const fuzzyGuesses = this.gameMetrics.filter(m => m.wordId === wordId && m.isFuzzy);
    const uniqueUsers = new Set(fuzzyGuesses.map(m => m.userId)).size;
    
    return {
      totalFuzzyGuesses: fuzzyGuesses.length,
      avgGuessNumber: fuzzyGuesses.length > 0 
        ? fuzzyGuesses.reduce((sum, m) => sum + m.guessNumber, 0) / fuzzyGuesses.length 
        : 0,
      uniqueUsers
    };
  }

  async getPlayerPerformanceMetrics(): Promise<PlayerPerformanceMetrics> {
    console.log('MockClient: getPlayerPerformanceMetrics called');
    return {
      fastestPlayers: [
        { username: 'wordninja', avgTimeSeconds: 30, gamesPlayed: 15 },
        { username: 'smartguesser', avgTimeSeconds: 45, gamesPlayed: 10 },
        { username: 'quickthinker', avgTimeSeconds: 55, gamesPlayed: 8 }
      ],
      fewestGuessesPlayers: [
        { username: 'wordninja', avgGuesses: 1.8, gamesPlayed: 15 },
        { username: 'guessguru', avgGuesses: 2.2, gamesPlayed: 12 },
        { username: 'smartguesser', avgGuesses: 2.5, gamesPlayed: 10 }
      ],
      leastHintsPlayers: [
        { username: 'nohintneeded', avgHintsUsed: 0.1, gamesPlayed: 9 },
        { username: 'wordninja', avgHintsUsed: 0.3, gamesPlayed: 15 },
        { username: 'smartguesser', avgHintsUsed: 0.5, gamesPlayed: 10 }
      ]
    };
  }

  async setupTables(importInitialWords: boolean = false): Promise<void> {
    console.log(`MockClient: setupTables called with importInitialWords: ${importInitialWords}`);
    // Implementation is empty as this is a mock
    return;
  }
} 