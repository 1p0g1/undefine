export interface WordData {
  id: string;
  word: string;
  clues: {
    D: string;  // Definition
    E: string;  // Etymology
    F: string;  // First letter
    I: string;  // In a sentence
    N: number;  // Number of letters
    E2: string[];  // Equivalents/synonyms
  };
}

export type HintIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const HINT_INDICES = {
  D: 0,  // Definition
  E2: 1, // Equivalents
  F: 2,  // First letter
  I: 3,  // In a sentence
  N: 4,  // Number of letters
  E: 5   // Etymology
} as const;

export type GuessResult = 'correct' | 'incorrect' | null;

export interface GameState {
  wordData: WordData | null;
  revealedHints: HintIndex[];
  guessCount: number;
  isGameOver: boolean;
  hasWon: boolean;
  guessResults: GuessResult[];
  isLoading: boolean;
} 