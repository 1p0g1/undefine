// Import shared types
import type { 
  WordEntry, 
  User as SharedUser, 
  UserCredentials as SharedUserCredentials, 
  AuthResult as SharedAuthResult,
  Word as SharedWord,
  LeaderboardEntry as SharedLeaderboardEntry,
  UserStats as SharedUserStats,
  DailyMetrics as SharedDailyMetrics,
  StreakLeader as SharedStreakLeader
} from '@reversedefine/shared-types';

// Re-export shared types
export type { 
  SharedUserCredentials as UserCredentials, 
  SharedAuthResult as AuthResult,
  SharedWord as Word,
  SharedLeaderboardEntry as LeaderboardEntry,
  SharedUserStats as UserStats,
  SharedDailyMetrics as DailyMetrics,
  SharedStreakLeader as StreakLeader
};

// Database-specific types
export interface DbWord extends SharedWord {
  wordId: string;
  etymology?: string;
  firstLetter: string;
  exampleSentence?: string;
  numLetters: number;
  difficulty?: string;
  timesUsed: number;
  lastUsedAt: Date | null;
  isPlural?: boolean;
  numSyllables?: number;
}

export interface User extends SharedUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface DbLeaderboardEntry extends SharedLeaderboardEntry {
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

export interface DailyLeaderboardResponse {
  entries: DbLeaderboardEntry[];
  userRank: number;
}

export interface DbUserStats extends SharedUserStats {
  username: string;
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  averageTime: number;
  bestTime: number;
  currentStreak: number;
  longestStreak: number;
  topTenCount: number;
  lastPlayedAt: string;
}

export interface DailyStatsResponse {
  date: string;
  totalPlays: number;
  uniqueUsers: number;
  averageGuesses: number;
  averageTime: number;
}

export interface GameSession {
  id: string;
  wordId: string;
  word: string;
  startTime: string;
  endTime?: string;
  guessesUsed: number;
  hintsUsed: number;
  fuzzyMatches: number;
  isComplete: boolean;
  isWon: boolean;
  userEmail?: string;
}

export interface DatabaseClient {
  // Connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Word operations
  getWords(page?: number, limit?: number): Promise<{ words: DbWord[], total: number }>;
  getWord(wordId: string): Promise<DbWord | null>;
  addWord(word: Omit<DbWord, 'wordId' | 'timesUsed' | 'lastUsedAt' | 'createdAt' | 'updatedAt'>): Promise<DbWord>;
  updateWord(wordId: string, word: Partial<DbWord>): Promise<DbWord>;
  deleteWord(wordId: string): Promise<boolean>;
  searchWords(query: string): Promise<DbWord[]>;
  getRandomWord(): Promise<DbWord | null>;
  getDailyWord(date?: string): Promise<DbWord | null>;
  checkGuess(wordId: string, guess: string): Promise<boolean>;
  
  // Stats operations
  getDailyStats(): Promise<DailyStatsResponse>;
  getTodayMetrics(): Promise<SharedDailyMetrics>;
  getTopStreaks(limit?: number): Promise<SharedStreakLeader[]>;
  getUserStats(username: string): Promise<DbUserStats | null>;
  updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
  
  // Authentication methods
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt'>, password: string): Promise<User>;
  verifyPassword(email: string, password: string): Promise<boolean>;
  
  // Leaderboard operations
  getDailyLeaderboard(): Promise<DailyLeaderboardResponse>;
  getAllTimeLeaderboard(): Promise<DbLeaderboardEntry[]>;
  getUserRank(username: string): Promise<number>;
  addLeaderboardEntry(entry: Omit<DbLeaderboardEntry, 'id' | 'createdAt'>): Promise<DbLeaderboardEntry>;
  
  // Game operations
  startGame(userEmail?: string): Promise<GameSession>;
  processGuess(gameId: string, guess: string, userEmail?: string): Promise<{ isCorrect: boolean; gameOver: boolean }>;
  getGameSession(gameId: string): Promise<GameSession | null>;
  endGame(gameId: string, won: boolean): Promise<void>;
} 