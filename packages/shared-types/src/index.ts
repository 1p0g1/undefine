/**
 * Represents a word entry in the application
 */
export interface Word {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  first_letter: string;
  in_a_sentence?: string;
  number_of_letters: number;
  equivalents: string[];
  difficulty: string;
}

/**
 * Represents a leaderboard entry
 */
export interface LeaderboardEntry {
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

/**
 * Represents user statistics
 */
export interface UserStats {
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

/**
 * Represents daily metrics
 */
export interface DailyMetrics {
  date: string;
  totalPlays: number;
  uniqueUsers: number;
  averageGuesses: number;
  averageTime: number;
}

/**
 * Represents a streak leader
 */
export interface StreakLeader {
  username: string;
  streak: number;
  lastPlayedAt: string;
}

/**
 * Represents a game session
 */
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

/**
 * Represents a word entry in the application
 */
export interface WordEntry {
  /** The word itself */
  word: string;
  /** The part of speech (noun, verb, etc.) */
  partOfSpeech: string;
  /** A list of synonyms for the word */
  synonyms?: string[];
  /** The primary definition of the word */
  definition: string;
  /** An optional alternate definition */
  alternateDefinition?: string;
  /** Date when this word will be the daily word (DD/MM/YY) */
  dateAdded: string;
  /** Letter count information */
  letterCount: {
    count: number;
    display: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the form state for adding/editing a word
 */
export interface FormState {
  word: string;
  partOfSpeech: string;
  synonyms: string[];
  definition: string;
  alternateDefinition: string;
  dateAdded: string;
  letterCount: {
    count: number;
    display: string;
  };
}

/**
 * Represents a validation error for a form field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Common API response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
}

/**
 * User information
 */
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * User credentials for authentication
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Represents the result of a guess
 */
export interface GuessResult {
  isCorrect: boolean;
  guess: string;
  isFuzzy: boolean;
  fuzzyPositions: number[];
  gameOver: boolean;
  correctWord?: string;
}

/**
 * Database client interface
 */
export interface DatabaseClient {
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  one: <T = any>(sql: string, params?: any[]) => Promise<T>;
  transaction: <T>(callback: (client: DatabaseClient) => Promise<T>) => Promise<T>;
}

/**
 * Represents the raw word data from Supabase API (snake_case)
 */
export interface ApiWord {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  first_letter: string;
  in_a_sentence?: string;
  number_of_letters: number;
  equivalents: string;
  difficulty: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Represents a word in the game context with transformed fields (camelCase)
 */
export interface GameWord {
  id: string;
  word: string;
  definition: string;
  etymology: string;
  firstLetter: string;
  inASentence: string;
  numberOfLetters: number;
  equivalents: string[];
  difficulty: string;
} 