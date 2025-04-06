import {
  DatabaseClient,
  Word,
  LeaderboardEntry,
  UserStats,
  DailyLeaderboardResponse,
  User,
  UserCredentials,
  AuthResult,
  DailyMetrics,
  StreakLeader,
  DailyStatsResponse,
} from '../../config/database/types.js';

/**
 * MockClient - A simplified database client for development and testing
 */
export class MockClient implements DatabaseClient {
  private connected = false;
  private words: Word[] = [
    {
      wordId: 'word1',
      word: 'example',
      definition: 'A representative form or pattern',
      etymology: 'From Latin exemplum',
      firstLetter: 'e',
      exampleSentence: 'This is an example sentence.',
      numLetters: 7,
      synonyms: ['model', 'pattern', 'sample'],
      difficulty: 'easy',
      timesUsed: 0,
      lastUsedAt: null,
      partOfSpeech: 'noun',
      isPlural: false,
      numSyllables: 3,
    },
  ];

  private leaderboard: LeaderboardEntry[] = [];
  private userStats: Map<string, UserStats> = new Map();
  private users: Map<string, User> = new Map([
    ['test@example.com', {
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      createdAt: new Date().toISOString(),
    }],
  ]);

  // Connection methods
  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async initializeDatabase(): Promise<void> {}
  async setupTables(): Promise<void> {}

  // Word methods
  async getWords(): Promise<Word[]> {
    return this.words;
  }

  async getWord(wordId: string): Promise<Word | null> {
    return this.words.find(w => w.wordId === wordId) || null;
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    const newWord: Word = {
      ...word,
      wordId: `word${this.words.length + 1}`,
      timesUsed: 0,
      lastUsedAt: null,
    };
    this.words.push(newWord);
    return newWord;
  }

  async updateWord(wordId: string, update: Partial<Word>): Promise<Word> {
    const index = this.words.findIndex(w => w.wordId === wordId);
    if (index === -1) throw new Error('Word not found');
    this.words[index] = { ...this.words[index], ...update };
    return this.words[index];
  }

  async deleteWord(wordId: string): Promise<void> {
    const index = this.words.findIndex(w => w.wordId === wordId);
    if (index !== -1) {
      this.words.splice(index, 1);
    }
  }

  async searchWords(query: string): Promise<Word[]> {
    const lowerQuery = query.toLowerCase();
    return this.words.filter(w => 
      w.word.toLowerCase().includes(lowerQuery) || 
      w.definition.toLowerCase().includes(lowerQuery)
    );
  }

  async getRandomWord(): Promise<Word | null> {
    if (this.words.length === 0) return null;
    return this.words[Math.floor(Math.random() * this.words.length)];
  }

  async getDailyWord(date: string): Promise<Word | null> {
    return this.words[0] || null;
  }

  async setDailyWord(wordId: string, date: string): Promise<void> {}

  async getNextUnusedWord(): Promise<Word | null> {
    return this.words.find(w => w.timesUsed === 0) || null;
  }

  async markAsUsed(wordId: string): Promise<void> {
    const word = await this.getWord(wordId);
    if (word) {
      word.timesUsed++;
      word.lastUsedAt = new Date();
    }
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.leaderboard.sort((a, b) => a.timeTaken - b.timeTaken);
  }

  async getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = this.leaderboard
      .filter(entry => new Date(entry.createdAt) >= today)
      .sort((a, b) => a.timeTaken - b.timeTaken);

    const userRank = userEmail ? 
      entries.findIndex(entry => entry.userEmail === userEmail) + 1 :
      undefined;

    const userStats = userEmail ? this.userStats.get(userEmail) || null : null;

    return { entries, userRank, userStats };
  }

  async addToLeaderboard(entry: Omit<LeaderboardEntry, 'id'>): Promise<void> {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    this.leaderboard.push(newEntry);
  }

  async getLeaderboardRank(gameId: string): Promise<number> {
    return this.leaderboard.findIndex(entry => entry.id === gameId) + 1;
  }

  // User stats methods
  async updateUserStats(userId: string): Promise<void> {
    if (!this.userStats[userId]) {
      this.userStats[userId] = {
        userId,
        gamesPlayed: 1,
        gamesWon: 1,
        currentStreak: 1,
        longestStreak: 1,
        averageTime: 0,
        averageGuesses: 0
      };
    } else {
      this.userStats[userId].gamesPlayed++;
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return (
      this.userStats[userId] || {
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageTime: 0,
        averageGuesses: 0
      }
    );
  }

  // Stats operations
  async getDailyStats() {
    return {
      date: new Date().toISOString().split('T')[0],
      totalGames: this.leaderboard.length,
      averageTime: 45,
      averageGuesses: 3,
      uniquePlayers: new Set(this.leaderboard.map(e => e.userId)).size
    };
  }

  async addGameStats() {
    // No-op in mock implementation
  }

  // Authentication methods
  async authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
    const user = this.users.get(credentials.email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    // In a mock client, we'll accept any password
    return { success: true, user };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    // No-op in mock implementation
  }

  async addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>): Promise<void> {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: `entry${this.leaderboard.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    this.leaderboard.push(newEntry);
  }

  async getDailyLeaderboard(): Promise<DailyLeaderboardResponse> {
    const userStats = Array.from(this.userStats.values())[0] || null;
    return {
      entries: this.leaderboard,
      userRank: 1,
      userStats,
    };
  }

  async getLeaderboardRank(gameId: string): Promise<number | null> {
    const index = this.leaderboard.findIndex(e => e.id === gameId);
    return index === -1 ? null : index + 1;
  }

  async updateUserStats(
    userEmail: string,
    won: boolean = false,
    guessCount: number = 0,
    timeTaken: number = 0
  ): Promise<UserStats> {
    let stats = this.userStats.get(userEmail);
    if (!stats) {
      stats = {
        userEmail,
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageTime: 0,
        averageGuesses: 0,
        lastPlayedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    stats.gamesPlayed++;
    if (won) {
      stats.gamesWon++;
      stats.currentStreak++;
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    } else {
      stats.currentStreak = 0;
    }

    stats.averageTime = ((stats.averageTime * (stats.gamesPlayed - 1)) + timeTaken) / stats.gamesPlayed;
    stats.averageGuesses = ((stats.averageGuesses * (stats.gamesPlayed - 1)) + guessCount) / stats.gamesPlayed;
    stats.lastPlayedAt = new Date().toISOString();
    stats.updatedAt = new Date().toISOString();

    this.userStats.set(userEmail, stats);
    return stats;
  }

  async getDailyStats(): Promise<DailyStatsResponse> {
    const metrics: DailyMetrics = {
      totalGames: this.leaderboard.length,
      averageTime: this.leaderboard.reduce((acc, e) => acc + e.timeTaken, 0) / this.leaderboard.length || 0,
      averageGuesses: this.leaderboard.reduce((acc, e) => acc + e.guessesUsed, 0) / this.leaderboard.length || 0,
      uniquePlayers: new Set(this.leaderboard.map(e => e.userEmail)).size,
      completionRate: this.leaderboard.filter(e => e.guessesUsed > 0).length / this.leaderboard.length || 0,
    };

    const streakLeaders: StreakLeader[] = Array.from(this.userStats.values())
      .map(stats => ({
        username: stats.userEmail,
        streak: stats.currentStreak,
      }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 10);

    return {
      metrics,
      streakLeaders,
    };
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    return {
      totalGames: this.leaderboard.length,
      averageTime: this.leaderboard.reduce((acc, e) => acc + e.timeTaken, 0) / this.leaderboard.length || 0,
      averageGuesses: this.leaderboard.reduce((acc, e) => acc + e.guessesUsed, 0) / this.leaderboard.length || 0,
      uniquePlayers: new Set(this.leaderboard.map(e => e.userEmail)).size,
      completionRate: this.leaderboard.filter(e => e.guessesUsed > 0).length / this.leaderboard.length || 0,
    };
  }

  async getTopStreaks(limit: number): Promise<StreakLeader[]> {
    return Array.from(this.userStats.values())
      .map(stats => ({
        username: stats.userEmail,
        streak: stats.currentStreak,
      }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, limit);
  }
} 