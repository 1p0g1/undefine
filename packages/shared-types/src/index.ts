/**
 * Shared types for Un-Define game
 */

// Import types needed for the DatabaseClient interface
import type { 
  WordData, 
  ClueType, 
  GuessResult, 
  Word,
  GameState,
  ClueStatus,
  WordClues,
  SafeClueData,
  Message,
  GuessHistory
} from './types/core.js';
import type { 
  GameSession, 
  UserStats, 
  LeaderboardEntry, 
  StreakLeader,
  GameWord,
  DailyMetrics
} from './types/app.js';
import type {
  DBWord,
  DBUserStats,
  DBGameSession,
  DBLeaderboardEntry,
  DBStreakLeader,
  DBDailyMetrics
} from './types/db.js';
import type {
  ExtendedLeaderboardEntry,
  LeaderboardState,
  LeaderboardFilters
} from './types/leaderboard.js';
import type { HintIndex } from './utils/game.js';
import { HINT_INDICES } from './utils/game.js';

// Core types
export type {
  GameState,
  WordData,
  ClueType,
  GuessResult,
  Word,
  WordClues,
  Message,
  GuessHistory,
  ClueStatus,
  SafeClueData
};

// Application types
export type {
  GameWord,
  UserStats,
  GameSession,
  LeaderboardEntry,
  StreakLeader,
  DailyMetrics
};

// Database types
export type {
  DBWord,
  DBUserStats,
  DBGameSession,
  DBLeaderboardEntry,
  DBStreakLeader,
  DBDailyMetrics
};

// Leaderboard types
export type {
  ExtendedLeaderboardEntry,
  LeaderboardState,
  LeaderboardFilters
};

// Game utilities and types
export type { HintIndex };
export { HINT_INDICES };

// Re-export all utility functions and types
export * from './utils/game.js';
export * from './utils/result.js';
export * from './utils/word.js';
export * from './utils/mappers.js';

// Result type for better error handling
export type Result<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

// User type
export type User = {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  last_login?: string;
};

// Form types
export type FormState = {
  isValid: boolean;
  errors: string[];
};

// Word entry type
export type WordEntry = {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  in_a_sentence?: string;
  first_letter?: string;
  number_of_letters?: number;
  equivalents?: string[];
  difficulty?: string;
  created_at?: string;
  updated_at?: string;
};

// API types
export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type WordResponse = ApiResponse<WordData>;
export type LeaderboardResponse = ApiResponse<LeaderboardEntry[]>;
export type GameSessionResponse = ApiResponse<GameSession>;
export type UserStatsResponse = ApiResponse<UserStats>;
export type ErrorResponse = ApiResponse<never>;
export type DailyWord = WordData;

// Database client interface
export interface DatabaseClient {
  connect(): Promise<Result<void>>;
  disconnect(): Promise<Result<void>>;
  getRandomWord(): Promise<Result<WordData>>;
  getDailyWord(): Promise<Result<WordData>>;
  processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<GuessResult>>;
  getUserStats(username: string): Promise<Result<UserStats | null>>;
  getLeaderboard(limit?: number): Promise<Result<LeaderboardEntry[]>>;
  getTopStreaks(limit?: number): Promise<Result<StreakLeader[]>>;
  submitScore(gameId: string, score: number): Promise<Result<void>>;
  getNextHint(gameId: string): Promise<Result<string>>;
  updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<Result<void>>;
  getGameSession(gameId: string): Promise<Result<GameSession>>;
  startGame(): Promise<Result<GameSession>>;
  endGame(gameId: string, won: boolean): Promise<Result<void>>;
  getClue(session: GameSession, clueType: ClueType): Promise<Result<string>>;
  getUserByUsername(username: string): Promise<Result<User | null>>;
  createUser(username: string): Promise<Result<User>>;
  addLeaderboardEntry(entry: LeaderboardEntry): Promise<Result<void>>;
  markAsUsed(wordId: string): Promise<Result<void>>;
}

// Error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}