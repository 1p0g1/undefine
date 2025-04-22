/**
 * Shared types for Un-Define game
 */

import { HintIndex, Message, GuessHistory, AppGameState, HINT_INDICES, INDEX_TO_HINT, clueTypeToNumber, numberToClueType, isHintAvailable, getHintContent } from './utils/game.js';

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

// Game core types
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

export type ClueStatus = {
  [key in ClueType]: 'neutral' | 'grey' | 'correct' | 'incorrect';
};

export type GameState = 'active' | 'completed' | 'expired';

// Database models
export interface Word {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  first_letter: string;
  in_a_sentence?: string;
  number_of_letters: number;
  equivalents: string[];
  difficulty?: string;
  times_used?: number;
  last_used_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GameSession {
  id: string;
  word_id: string;
  word: string;
  words?: Word;
  word_snapshot?: string;
  start_time: string;
  guesses: string[];
  guesses_used: number;
  revealed_clues: ClueType[];
  clue_status: ClueStatus;
  is_complete: boolean;
  is_won: boolean;
  end_time?: string;
  state: GameState;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface UserStats {
  username: string;
  games_played: number;
  games_won: number;
  average_guesses: number;
  average_time: number;
  current_streak: number;
  longest_streak: number;
  last_played_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface Score {
  id: string;
  player_id: string;
  word: string;
  guesses_used: number;
  used_hint: boolean;
  completion_time_seconds: number;
  nickname?: string;
  created_at?: string;
}

// API interfaces
export interface GuessResult {
  isCorrect: boolean;
  guess: string;
  gameOver: boolean;
  correctWord?: string;
  nextHint?: {
    type: ClueType;
    hint: string;
  };
}

export interface WordClues {
  D: string; // Definition
  E: string; // Etymology
  F: string; // First letter
  I: string; // Example sentence (I for "In a sentence")
  N: number; // Number of letters
  E2: string[]; // Equivalents/Synonyms
}

export interface GameWord {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  firstLetter?: string;
  inASentence?: string;
  numberOfLetters?: number;
  equivalents?: string[];
  difficulty?: string;
  clues?: WordClues;
}

export interface GameResponse {
  gameId: string;
  word: GameWord;
}

export interface ApiWord {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  first_letter: string;
  in_a_sentence?: string;
  number_of_letters: number;
  equivalents: string | string[];
  difficulty: string;
  created_at?: string;
  updated_at?: string;
}

// Form & validation types
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

export interface WordEntry {
  word: string;
  partOfSpeech: string;
  synonyms?: string[];
  definition: string;
  alternateDefinition?: string;
  dateAdded: string;
  letterCount: {
    count: number;
    display: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Leaderboard & stats types
export interface DailyMetrics {
  date: string;
  totalPlays: number;
  uniqueUsers: number;
  averageGuesses: number;
  averageTime: number;
}

export interface StreakLeader {
  username: string;
  streak: number;
  lastPlayedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  wordId: string;
  word: string;
  timeTaken: number;
  guessesUsed: number;
  fuzzyMatches?: number;
  hintsUsed?: number;
  createdAt: string;
}

// Service interfaces
export interface DatabaseClient {
  connect(): Promise<Result<void>>;
  disconnect(): Promise<Result<void>>;
  getRandomWord(): Promise<Result<Word>>;
  getDailyWord(): Promise<Result<Word>>;
  processGuess(gameId: string, guess: string, session: GameSession): Promise<Result<GuessResult>>;
  getUserStats(username: string): Promise<Result<UserStats | null>>;
  updateUserStats(username: string, won: boolean, guessesUsed: number, timeTaken: number): Promise<Result<void>>;
  getGameSession(gameId: string): Promise<Result<GameSession | null>>;
  startGame(): Promise<Result<GameSession>>;
  endGame(gameId: string, won: boolean): Promise<Result<void>>;
  getUserByUsername(username: string): Promise<Result<User | null>>;
  createUser(username: string): Promise<Result<User>>;
  getClue(session: GameSession, clueType: ClueType): Promise<Result<string | number | null>>;
  getNextHint(session: GameSession): Promise<Result<{ hint: string; type: ClueType }>>;
  submitScore(score: {
    playerId: string;
    word: string;
    guessesUsed: number;
    usedHint: boolean;
    completionTime: number;
    nickname?: string;
  }): Promise<Result<void>>;
}

// Game utility types and functions
export { 
  HintIndex,
  Message,
  AppGameState,
  HINT_INDICES,
  INDEX_TO_HINT,
  clueTypeToNumber,
  numberToClueType,
  isHintAvailable,
  getHintContent
} from './utils/game.js'; 