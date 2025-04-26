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

// Word data type
export interface WordData {
  id: string;
  word: string;
  definition: string;
  etymology: string | null;
  first_letter: string;
  in_a_sentence: string | null;
  number_of_letters: number;
  equivalents: string | null;
  difficulty: string | null;
  created_at: string | null;
  updated_at: string | null;
  clues: WordClues;
}

// Safe clue data type
export interface SafeClueData {
  D: string;
  E: string | null;
  F: string;
  I: string | null;
  N: number;
  E2: string | null;
} 