import { 
  DatabaseClient, 
  Word, 
  LeaderboardEntry, 
  UserStats, 
  DailyLeaderboardResponse, 
  DailyStatsResponse, 
  DailyMetrics, 
  StreakLeader 
} from './index.js';

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
    return this.words;
  }

  async getWord(id: string): Promise<Word | null> {
    return this.words.find(word => word.wordId === id) || null;
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    const newWord = { ...word, wordId: (this.words.length + 1).toString() };
    this.words.push(newWord);
    return newWord;
  }

  async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    const index = this.words.findIndex(w => w.wordId === id);
    if (index === -1) {
      throw new Error(`Word with ID ${id} not found`);
    }
    this.words[index] = { ...this.words[index], ...word };
    return this.words[index];
  }

  async deleteWord(id: string): Promise<void> {
    const index = this.words.findIndex(w => w.wordId === id);
    if (index !== -1) {
      this.words.splice(index, 1);
    }
  }

  async searchWords(query: string): Promise<Word[]> {
    return this.words.filter(
      word => word.word.includes(query) || word.definition.includes(query)
    );
  }

  async getRandomWord(): Promise<Word> {
    return this.words[Math.floor(Math.random() * this.words.length)];
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.leaderboard.sort((a, b) => a.completion_time_seconds - b.completion_time_seconds);
  }

  async getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse> {
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
    const newEntry = { ...entry, id: (this.leaderboard.length + 1).toString() };
    this.leaderboard.push(newEntry);
  }

  async getLeaderboardRank(gameId: string): Promise<number> {
    return 1; // Mock implementation always returns rank 1
  }

  async updateUserStats(username: string): Promise<void> {
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
    return {
      total_plays: 25,
      unique_users: 10,
      avg_guesses: 2.5,
      avg_completion_time: 50
    };
  }

  async getTopStreaks(limit: number = 10): Promise<StreakLeader[]> {
    return [
      { username: 'wordninja', current_streak: 7, longest_streak: 7 },
      { username: 'smartguesser', current_streak: 3, longest_streak: 5 }
    ].slice(0, limit);
  }

  // Auth methods
  async authenticateUser(credentials: { email: string; password: string }): Promise<{ token: string; user: { email: string; id: string } }> {
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: credentials.email
      }
    };
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    return {
      id: '1',
      email
    };
  }
} 