import type { Word } from '../types/shared.js';

export interface GameState {
  word: Word | null;
  guesses: string[];
  fuzzyMatches: number;
  hintsUsed: number;
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
  isWon: boolean;
  error: string | null;
}

export interface GameStats {
  timeTaken: number;
  guessesUsed: number;
  fuzzyMatches: number;
  hintsUsed: number;
  isWon: boolean;
}

export interface GameContext {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export type GameAction =
  | { type: 'START_GAME'; payload: Word }
  | { type: 'MAKE_GUESS'; payload: string }
  | { type: 'USE_HINT' }
  | { type: 'END_GAME'; payload: { isWon: boolean } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_ERROR'; payload: string };

export interface WordDefinition {
  id: string;
  word: string;
  definition: string;
  part_of_speech: string;
}

export interface WordWithDefinition extends Word {
  definitions: WordDefinition[];
} 