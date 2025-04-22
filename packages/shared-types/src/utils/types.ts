/**
 * Core shared types for Un-Define game
 */

// Game core types
export type GameState = 'active' | 'completed' | 'expired';

// Clue types
export type ClueType = 'D' | 'E' | 'F' | 'I' | 'N' | 'E2';

export type ClueStatus = {
  [key in ClueType]: 'neutral' | 'grey' | 'correct' | 'incorrect';
};

// Guess result type
export interface GuessResult {
  isCorrect: boolean;
  guess: string;
  isFuzzy: boolean;
  fuzzyPositions: number[];
  gameOver: boolean;
  correctWord?: string;
}

// Word clues type
export interface WordClues {
  D: string; // Definition
  E: string | null; // Etymology
  F: string; // First letter
  I: string | null; // Example sentence (I for "In a sentence")
  N: number; // Number of letters
  E2: string | null; // Equivalents/Synonyms
} 