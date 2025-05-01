import type { GameState, WordData, HintIndex, GuessResult } from '@undefine/shared-types';

export interface GameProps {
  initialState?: Partial<GameState>;
  onGameEnd?: (result: GuessResult) => void;
  onHintReveal?: (hintIndex: HintIndex) => void;
}

export interface GameContextValue {
  state: GameState;
  startNewGame: () => void;
  revealHint: (hintIndex: HintIndex) => void;
  submitGuess: (guess: string) => Promise<GuessResult>;
  resetGame: () => void;
}

export interface GameConfig {
  maxGuesses: number;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: {
    enabled: boolean;
    maxCount: number;
    cooldown: number;
  };
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  fastestWin: number;
  longestStreak: number;
  currentStreak: number;
}

export interface GameSettings {
  sound: boolean;
  animations: boolean;
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

export interface GameHistory {
  id: string;
  word: WordData;
  guesses: string[];
  hintsRevealed: HintIndex[];
  isCorrect: boolean;
  timestamp: string;
} 