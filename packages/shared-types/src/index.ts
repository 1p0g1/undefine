/**
 * Shared types for Un-Define game
 */

import { HintIndex, Message, GuessHistory, AppGameState, HINT_INDICES, INDEX_TO_HINT, clueTypeToNumber, numberToClueType, isHintAvailable, getHintContent } from './utils/game.js';
import { WordData, SafeClueData, validateWordData, isWordData, validateClues, validateWordId, validateWordLength, validateFirstLetter } from './utils/word.js';
import { GameState, ClueType, ClueStatus, GuessResult, WordClues } from './utils/types.js';

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

// Re-export all types
export {
  // Game types
  HintIndex,
  Message,
  GuessHistory,
  AppGameState,
  HINT_INDICES,
  INDEX_TO_HINT,
  clueTypeToNumber,
  numberToClueType,
  isHintAvailable,
  getHintContent,
  GameState,
  ClueType,
  ClueStatus,
  GuessResult,
  WordClues,
  
  // Word types
  WordData,
  SafeClueData,
  validateWordData,
  isWordData,
  validateClues,
  validateWordId,
  validateWordLength,
  validateFirstLetter
};

// Database models
export interface GameSession {
  id: string;
  user_id: string;
  word_id: string;
  word: string;
  words?: WordData;
  word_snapshot?: string;
  start_time: string;
  end_time?: string;
  guesses: string[];
  hints_revealed: number[];
  completed: boolean;
  won: boolean;
  score?: number;
}

// API interfaces
export interface GameResponse {
  gameId: string;
  word: WordData;
}

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
}

// User stats interface
export interface UserStats {
  username: string;
  games_played: number;
  games_won: number;
  average_guesses: number;
  average_time: number;
  current_streak: number;
  longest_streak: number;
  last_played_at: string;
}

// Leaderboard entry interface
export interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

// Streak leader interface
export interface StreakLeader {
  username: string;
  current_streak: number;
  longest_streak: number;
} 