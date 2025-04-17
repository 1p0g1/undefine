/**
 * Represents a word entry in the application
 */
export interface Word {
  id: string;
  word: string;
  definition: string;
  etymology: string;
  first_letter: string;
  in_a_sentence: string;
  number_of_letters: number;
  equivalents: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timesUsed?: number;
  lastUsedAt?: string | null;
  /** Date when this word will be the daily word (DD/MM/YY) */
  dateAdded?: string;
  /** Letter count information */
  letterCount?: {
    count: number;
    display: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Represents a user in the application
 */
export interface User {
  id: string;
  username: string;
  created_at: string;
}

/**
 * Represents a game session
 */
export interface GameSession {
  id: string;
  word_id: string;
  word: string;
  guesses: string[];
  guesses_used: number;
  revealed_clues: string[];
  clue_status: ClueStatus;
  is_complete: boolean;
  is_won: boolean;
  start_time: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
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
 * Represents a streak leader
 */
export interface StreakLeader {
  username: string;
  streak: number;
  lastPlayed: string;
}

/**
 * Represents user statistics
 */
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

/**
 * Represents daily metrics
 */
export interface DailyMetrics {
  totalGames: number;
  averageTime: number;
  averageGuesses: number;
  uniquePlayers: number;
  completionRate: number;
}

/**
 * Represents the response for daily leaderboard
 */
export interface DailyLeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank: number;
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
 * Database client interface
 */
export interface DatabaseClient {
  // Connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Word operations
  getDailyWord(): Promise<Word>;
  getRandomWord(): Promise<Word>;
  
  // Game operations
  startGame(): Promise<GameSession>;
  getGameSession(gameId: string): Promise<GameSession | null>;
  processGuess(gameId: string, guess: string, session: GameSession): Promise<GuessResult>;
  checkGuess(wordId: string, guess: string): Promise<boolean>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(username: string): Promise<User>;
  endGame(gameId: string, won: boolean): Promise<void>;
  getClue(session: GameSession, clueType: ClueType): Promise<string | number | null>;
  getUserStats(username: string): Promise<UserStats | null>;
  updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<void>;
  
  // Hint operations
  getNextHint(session: GameSession): Promise<{ hint: string; type: ClueType }>;
  
  // Score operations
  submitScore(score: {
    playerId: string;
    word: string;
    guessesUsed: number;
    usedHint: boolean;
    completionTime: number;
    nickname?: string;
  }): Promise<void>;
}

// Game-specific types
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

export interface ClueStatus {
  [key: string]: 'neutral' | 'grey' | 'correct' | 'incorrect';
} 