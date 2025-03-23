import { SnowflakeClient } from './SnowflakeClient.js';
import { MongoDBClient } from './MongoDBClient.js';
import { MockClient } from '../../services/databases/MockClient.js';
import dotenv from 'dotenv';

dotenv.config();

const DB_PROVIDER = process.env.DB_PROVIDER || 'mock'; // Default to mock in development

export interface Word {
  wordId: string;
  word: string;
  definition: string;
  partOfSpeech: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  word: string;
  guesses: number;
  completion_time_seconds: number;
  used_hint: boolean;
  completed: boolean;
  created_at: string;
}

export interface UserStats {
  games_played: number;
  average_guesses: number;
  average_time: number;
  best_time: number;
  current_streak: number;
  longest_streak: number;
  top_ten_count: number;
  last_result: string;
  last_updated: string;
}

export interface DailyMetrics {
  total_plays: number;
  unique_users: number;
  avg_guesses: number;
  avg_completion_time: number;
}

export interface StreakLeader {
  username: string;
  current_streak: number;
  longest_streak: number;
}

export interface DailyStatsResponse {
  metrics: DailyMetrics;
  streakLeaders: StreakLeader[];
}

export interface DailyLeaderboardResponse {
  entries: LeaderboardEntry[];
  userStats?: UserStats;
  userRank?: number;
}

export interface GameMetric {
  gameId: string;
  userId: string;
  wordId: string;
  guess: string;
  isCorrect: boolean;
  isFuzzy: boolean;
  guessNumber: number;
  guessTimeSeconds: number;
  hintsUsed: number;
}

export interface FuzzyGuessMetrics {
  totalFuzzyGuesses: number;
  avgGuessNumber: number;
  uniqueUsers: number;
}

export interface PlayerPerformanceMetrics {
  fastestPlayers: { username: string; avgTimeSeconds: number; gamesPlayed: number }[];
  fewestGuessesPlayers: { username: string; avgGuesses: number; gamesPlayed: number }[];
  leastHintsPlayers: { username: string; avgHintsUsed: number; gamesPlayed: number }[];
}

export interface DatabaseClient {
  // Connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Word methods
  getWords(): Promise<Word[]>;
  getWord(id: string): Promise<Word | null>;
  addWord(word: Omit<Word, 'wordId'>): Promise<Word>;
  updateWord(id: string, word: Partial<Word>): Promise<Word>;
  deleteWord(id: string): Promise<void>;
  searchWords(query: string): Promise<Word[]>;
  getRandomWord(): Promise<Word>;
  markAsUsed(wordId: string): Promise<void>;

  // Leaderboard methods
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getDailyLeaderboard(userEmail?: string): Promise<DailyLeaderboardResponse>;
  addToLeaderboard(entry: Omit<LeaderboardEntry, 'id'>): Promise<void>;
  getLeaderboardRank(gameId: string): Promise<number>;
  updateUserStats(username: string): Promise<void>;
  getUserStats(username: string): Promise<UserStats>;

  // Stats methods
  getDailyStats(): Promise<DailyStatsResponse>;
  getTodayMetrics(): Promise<DailyMetrics>;
  getTopStreaks(limit: number): Promise<StreakLeader[]>;

  // Game metrics methods
  executeQuery?<T = any>(query: string, params?: any[], useConnection?: any): Promise<T[]>;
  saveGameMetric?(metric: GameMetric): Promise<void>;
  getFuzzyGuessMetrics?(wordId: string): Promise<FuzzyGuessMetrics>;
  getPlayerPerformanceMetrics?(): Promise<PlayerPerformanceMetrics>;

  // Auth methods
  authenticateUser(credentials: { email: string; password: string }): Promise<{ token: string; user: { email: string; id: string } }>;
  getUserByEmail(email: string): Promise<{ id: string; email: string } | null>;
  
  // Admin methods
  getDatabaseInfo?(): Promise<{
    version: string;
    database: string;
    schema: string;
    warehouse: string;
    tableCount: number;
  }>;
  listTables?(): Promise<string[]>;
  countTableRows?(tableName: string): Promise<number>;
  getSampleTableData?(tableName: string, limit?: number): Promise<Record<string, any>[]>;
  describeTable?(tableName: string): Promise<{ name: string; type: string }[]>;
  setupTables?(importInitialWords?: boolean): Promise<void>;
}

export function createDatabaseClient(): DatabaseClient {
  try {
    // Always use mock in development or when ENV var is set
    if (process.env.NODE_ENV === 'development' || DB_PROVIDER.toLowerCase() === 'mock') {
      console.log('[DATABASE] Using mock database client for development');
      return MockClient.getInstance();
    }
    
    console.log(`Creating database client using provider: ${DB_PROVIDER.toLowerCase()}`);
    
    switch (DB_PROVIDER.toLowerCase()) {
      case 'snowflake':
        try {
          console.log('Initializing Snowflake client...');
          return new SnowflakeClient();
        } catch (error) {
          console.error('Failed to initialize Snowflake client:', error);
          console.warn('Falling back to mock client...');
          return MockClient.getInstance();
        }
      case 'mongodb':
        try {
          console.log('Initializing MongoDB client...');
          return new MongoDBClient();
        } catch (error) {
          console.error('Failed to initialize MongoDB client:', error);
          console.warn('Falling back to mock client...');
          return MockClient.getInstance();
        }
      default:
        console.warn(`Unsupported database provider: ${DB_PROVIDER}, falling back to mock client`);
        return MockClient.getInstance();
    }
  } catch (error) {
    console.error('Critical error in database client creation:', error);
    console.error('Falling back to mock client...');
    return MockClient.getInstance();
  }
}

// Export a singleton instance
export const db = createDatabaseClient(); 