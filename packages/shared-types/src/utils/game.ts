/**
 * Game state types for Un-Define game
 */

import type { WordClues, GuessResult } from '../types/core';

/**
 * Hint index type representing the position of a hint in the hint array
 * 0: Definition (D)
 * 1: Etymology (E)
 * 2: First letter (F)
 * 3: In a sentence (I)
 * 4: Number of letters (N)
 * 5: Equivalents (E2)
 */
export type HintIndex = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Message type for displaying information to the user
 */
export type Message = {
  type: 'info' | 'success' | 'error' | 'warning';
  text: string;
};

/**
 * History of a guess with its result
 */
export type GuessHistory = {
  guess: string;
  timestamp: number;
  result: GuessResult;
};

/**
 * Canonical game state for the Un-Define game
 */
export type AppGameState = {
  loading: boolean;
  wordData: WordClues | null;
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
};

/**
 * Mapping from hint type to index
 */
export const HINT_INDICES = {
  D: 0,
  E: 1,
  F: 2,
  I: 3,
  N: 4,
  E2: 5
} as const;

export type ClueTypeToIndex = typeof HINT_INDICES;
export type IndexToClueType = {
  [K in keyof ClueTypeToIndex as ClueTypeToIndex[K]]: K;
};

/**
 * Mapping from index to hint type
 */
export const INDEX_TO_HINT: IndexToClueType = {
  0: 'D',
  1: 'E',
  2: 'F',
  3: 'I',
  4: 'N',
  5: 'E2'
} as const;

/**
 * Helper function to convert a clue type to an index
 */
export const clueTypeToNumber = (type: keyof typeof HINT_INDICES): HintIndex => HINT_INDICES[type] as HintIndex;

/**
 * Helper function to convert an index to a clue type
 */
export const numberToClueType = (index: HintIndex): keyof typeof HINT_INDICES => INDEX_TO_HINT[index];

/**
 * Helper function to check if a hint is available for a given word
 */
export const isHintAvailable = (wordData: WordClues | null, hintIndex: HintIndex): boolean => {
  if (!wordData) return false;
  const clueType = numberToClueType(hintIndex);
  return Boolean(wordData[clueType]);
};

/**
 * Helper function to get the hint content for a given word and hint index
 */
export const getHintContent = (wordData: WordClues | null, hintIndex: HintIndex): string | number | string[] | null => {
  if (!wordData) return null;
  const clueType = numberToClueType(hintIndex);
  return wordData[clueType] ?? null;
}; 