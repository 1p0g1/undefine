import { MongoClient, Collection, ObjectId } from 'mongodb';
import { DatabaseClient, Word, LeaderboardEntry, UserStats, DailyMetrics, StreakLeader, DailyStatsResponse, DailyLeaderboardResponse } from './index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class MongoDBClient implements DatabaseClient {
  private client: MongoClient;
  private wordsCollection!: Collection;
  private leaderboardCollection!: Collection;
  private userStatsCollection!: Collection;

  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(uri);
    console.log('MongoDBClient initialized with URI:', uri);
  }

  async connect(): Promise<void> {
    console.log('MongoDBClient: Connecting to database...');
    await this.client.connect();
    const db = this.client.db('reversedefine');
    this.wordsCollection = db.collection('words');
    this.leaderboardCollection = db.collection('leaderboard');
    this.userStatsCollection = db.collection('userStats');
    console.log('MongoDBClient: Successfully connected to database');
  }

  async disconnect(): Promise<void> {
    console.log('MongoDBClient: Disconnecting from database...');
    await this.client.close();
    console.log('MongoDBClient: Successfully disconnected from database');
  }

  // Word methods
  async getWords(): Promise<Word[]> {
    throw new Error("Method getWords() not implemented in MongoDBClient");
  }

  async getWord(id: string): Promise<Word | null> {
    throw new Error("Method getWord() not implemented in MongoDBClient");
  }

  async addWord(word: Omit<Word, 'wordId'>): Promise<Word> {
    throw new Error("Method addWord() not implemented in MongoDBClient");
  }

  async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    throw new Error("Method updateWord() not implemented in MongoDBClient");
  }

  async deleteWord(id: string): Promise<void> {
    throw new Error("Method deleteWord() not implemented in MongoDBClient");
  }

  async searchWords(query: string): Promise<Word[]> {
    throw new Error("Method searchWords() not implemented in MongoDBClient");
  }

  async getRandomWord(): Promise<Word> {
    console.log('MongoDBClient: Getting random word...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await this.wordsCollection.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $sample: { size: 1 } }
    ]).toArray();
    
    if (!result.length) {
      console.log('MongoDBClient: No words available for today');
      throw new Error('No words available');
    }
    
    console.log('MongoDBClient: Successfully retrieved random word');
    return {
      wordId: result[0]._id.toString(),
      word: result[0].word,
      definition: result[0].definition,
      partOfSpeech: result[0].partOfSpeech
    };
  }

  /**
   * Mark a word as used, incrementing its usage count and updating its last used date
   * @param wordId The ID of the word to mark as used
   */
  async markAsUsed(wordId: string): Promise<void> {
    console.log(`MongoDBClient: Marking word ${wordId} as used`);
    try {
      const result = await this.wordsCollection.updateOne(
        { _id: new ObjectId(wordId) },
        { 
          $inc: { timesUsed: 1 },
          $set: { 
            lastUsedDate: new Date(),
            updatedAt: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        console.log(`MongoDBClient: Word with ID ${wordId} not found`);
        throw new Error('Word not found');
      }
      
      console.log(`MongoDBClient: Successfully marked word ${wordId} as used`);
    } catch (error) {
      console.error('MongoDBClient: Error marking word as used:', error);
      throw new Error(`Failed to mark word as used: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    console.log('MongoDBClient: Getting leaderboard entries...');
    const entries = await this.leaderboardCollection.find()
      .sort({ guesses: 1, completion_time_seconds: 1 })
      .toArray();
    
    console.log('MongoDBClient: Successfully retrieved leaderboard entries');
    return entries.map(entry => ({
      id: entry._id.toString(),
      username: entry.username,
      word: entry.word,
      guesses: entry.guesses,
      completion_time_seconds: entry.completion_time_seconds,
      used_hint: entry.used_hint,
      completed: entry.completed,
      created_at: entry.created_at.toISOString()
    }));
  }

  async getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse> {
    throw new Error("Method getDailyLeaderboard() not implemented in MongoDBClient");
  }

  async addToLeaderboard(entry: Omit<LeaderboardEntry, 'id'>): Promise<void> {
    console.log('MongoDBClient: Adding entry to leaderboard...');
    const id = new ObjectId().toString();
    await this.leaderboardCollection.insertOne({
      _id: new ObjectId(id),
      ...entry,
      created_at: new Date()
    });
    await this.updateUserStats(entry.username);
    console.log('MongoDBClient: Successfully added entry to leaderboard');
  }

  async getLeaderboardRank(gameId: string): Promise<number> {
    throw new Error("Method getLeaderboardRank() not implemented in MongoDBClient");
  }

  async updateUserStats(username: string): Promise<void> {
    throw new Error("Method updateUserStats() not implemented in MongoDBClient");
  }

  // Stats methods
  async getDailyStats(): Promise<DailyStatsResponse> {
    throw new Error("Method getDailyStats() not implemented in MongoDBClient");
  }

  async getTodayMetrics(): Promise<DailyMetrics> {
    throw new Error("Method getTodayMetrics() not implemented in MongoDBClient");
  }

  async getTopStreaks(limit: number): Promise<StreakLeader[]> {
    throw new Error("Method getTopStreaks() not implemented in MongoDBClient");
  }

  async getUserStats(username: string): Promise<UserStats> {
    console.log('MongoDBClient: Getting user stats for:', username);
    const stats = await this.userStatsCollection.findOne({ username });
    
    if (!stats) {
      console.log('MongoDBClient: No stats found for user:', username);
      return {
        games_played: 0,
        average_guesses: 0,
        average_time: 0,
        best_time: 0,
        current_streak: 0,
        longest_streak: 0,
        top_ten_count: 0,
        last_result: 'loss',
        last_updated: new Date().toISOString()
      };
    }

    console.log('MongoDBClient: Successfully retrieved user stats');
    return {
      games_played: stats.games_played || 0,
      average_guesses: stats.average_guesses || 0,
      average_time: stats.average_time || 0,
      best_time: stats.best_time || 0,
      current_streak: stats.current_streak || 0,
      longest_streak: stats.longest_streak || 0,
      top_ten_count: stats.top_ten_count || 0,
      last_result: stats.last_result || 'loss',
      last_updated: stats.last_updated?.toISOString() || new Date().toISOString()
    };
  }

  // Auth methods
  async authenticateUser(credentials: { email: string; password: string }): Promise<{ token: string; user: { email: string; id: string } }> {
    console.log('MongoDBClient: Authenticating user:', credentials.email);
    const user = await this.client.db('reversedefine').collection('users').findOne({ email: credentials.email });
    
    if (!user) {
      console.log('MongoDBClient: User not found');
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      console.log('MongoDBClient: Invalid password');
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { email: user.email, id: user._id.toString() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('MongoDBClient: User authenticated successfully');
    return {
      token,
      user: {
        email: user.email,
        id: user._id.toString()
      }
    };
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    console.log('MongoDBClient: Getting user by email:', email);
    const user = await this.client.db('reversedefine').collection('users').findOne({ email });
    
    if (!user) {
      console.log('MongoDBClient: User not found');
      return null;
    }

    console.log('MongoDBClient: User found');
    return {
      id: user._id.toString(),
      email: user.email
    };
  }
} 