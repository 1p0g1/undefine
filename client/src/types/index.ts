import { WordData } from '@shared/utils/word.js';

export interface Word {
  id: string;
  word: string;
  definition: string;
  etymology?: string;
  first_letter?: string;
  in_a_sentence?: string;
  number_of_letters?: number;
  equivalents?: string[];
}

export interface GuessResult {
  isCorrect: boolean;
  correctWord: string;
  guessedWord: string;
  isFuzzy: boolean;
  fuzzyPositions?: number[];
  leaderboardRank?: number;
}

export interface GameState {
  gameId: string;
  word: string;
  guessCount: number;
  isGameOver: boolean;
  isCorrect: boolean;
  remainingGuesses: number;
  loading: boolean;
  showConfetti?: boolean;
  showLeaderboard?: boolean;
  message?: Message | null;
  guess?: string;
  timer?: number;
  fuzzyMatchPositions?: number[];
  guessHistory?: GuessHistory[];
  correctWord?: string;
  guessResults?: ('correct' | 'incorrect' | null)[];
  revealedHints?: number[];
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  rank: number;
  timestamp: string;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalGames: number;
  gamesWon: number;
  averageGuesses: number;
  averageTime: number;
}

export interface UserPreferences {
  darkMode: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  keyboardShortcutsEnabled: boolean;
}

export interface GameStats {
  totalGames: number;
  gamesWon: number;
  averageGuesses: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ClientGuessResult extends GuessResult {
  message?: string;
}

export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

export interface GuessHistory {
  guess: string;
  timestamp: number;
  result: GuessResult;
}

export interface Message {
  type: 'info' | 'success' | 'error' | 'warning';
  text: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export interface GameSession {
  id: string;
  userId: string;
  wordId: string;
  startTime: string;
  endTime?: string;
  isComplete: boolean;
  guessCount: number;
  isCorrect: boolean;
  hints: number[];
}

export const HINT_INDICES = {
  D: 0,
  E: 1,
  F: 2,
  I: 3,
  N: 4,
  E2: 5
} as const;

export type { WordData };

// Re-export types from game.ts
export * from './game.js'; 