// Local type definitions
import { WordData as SharedWordData, SafeClueData } from '@shared/utils/word';

// Re-export shared types with local modifications
export type WordData = SharedWordData;
export type { SafeClueData };

// Export HINT_INDICES
export const HINT_INDICES = {
  D: 0,  // Definition
  E: 1,  // Etymology
  F: 2,  // First letter
  I: 3,  // In a sentence
  N: 4,  // Number of letters
  E2: 5, // Equivalents
} as const;

// Game types
export type ClueType = keyof typeof HINT_INDICES;
export type HintIndex = (typeof HINT_INDICES)[ClueType];

// Helper functions for hint type conversion
export const clueTypeToNumber = (type: ClueType): HintIndex => HINT_INDICES[type];
export const numberToClueType = (num: HintIndex): ClueType => {
  const entry = Object.entries(HINT_INDICES).find(([_, value]) => value === num);
  if (!entry) throw new Error(`Invalid hint number: ${num}`);
  return entry[0] as ClueType;
};

export interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface GuessResponse {
  isCorrect: boolean;
  correctWord?: string;
}

export interface GuessHistory {
  guess: string;
  result: GuessResponse;
  timestamp: number;
}

export interface GuessResult {
  isCorrect: boolean;
  guess: string;
  isFuzzy: boolean;
  fuzzyPositions: number[];
  gameOver: boolean;
  correctWord?: string;
}

export interface ClientGuessResult {
  isCorrect: boolean;
  guess: string;
  isFuzzy: boolean;
  fuzzyPositions: number[];
  gameOver: boolean;
  correctWord?: string;
}

// Base game state properties that are always present
export interface BaseGameState {
  loading: boolean;
  error?: string;
  wordData: WordData | null;
  revealedHints: HintIndex[];
  remainingGuesses: number;
  isGameOver: boolean;
  hasWon: boolean;
  isCorrect: boolean;
  showConfetti: boolean;
  showLeaderboard: boolean;
  message: Message | null;
  guessCount: number;
  guessHistory: GuessHistory[];
  guessResults: GuessResult[];
  fuzzyMatchPositions: number[];
}

export interface LoadingGameState extends BaseGameState {
  loading: true;
  wordData: null;
}

export interface ActiveGameState extends BaseGameState {
  loading: false;
  wordData: WordData;
}

export type GameState = LoadingGameState | ActiveGameState;

export function isGameLoaded(state: GameState): state is ActiveGameState {
  return !state.loading && state.wordData !== null;
}

export function isGameInProgress(state: GameState): state is ActiveGameState {
  return isGameLoaded(state) && !state.isGameOver;
}

// Initial game state
export const initialGameState: LoadingGameState = {
  loading: true,
  error: '',
  wordData: null,
  revealedHints: [HINT_INDICES.D],
  remainingGuesses: 6,
  isGameOver: false,
  hasWon: false,
  isCorrect: false,
  showConfetti: false,
  showLeaderboard: false,
  message: null,
  guessCount: 0,
  guessHistory: [],
  guessResults: [],
  fuzzyMatchPositions: []
};

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  sound: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  fastestTime: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  rank?: number;
}

export interface UserStats {
  totalGames: number;
  gamesWon: number;
  averageGuesses: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
}