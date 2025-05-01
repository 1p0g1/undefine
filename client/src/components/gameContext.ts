import * as React from 'react';
import type { WordData, HintIndex, GuessResult, GameState as SharedGameState, Message } from '@undefine/shared-types';

// Local type - extends shared GameState with React-specific fields
export interface GameState {
  // Shared GameState properties
  wordData: WordData | null;
  guesses: string[];
  isCorrect: boolean;
  isGameOver: boolean;
  loading: boolean;
  error?: string;
  timer: number;
  hintLevel: number;
  revealedHints: HintIndex[];
  guessCount: number;
  guessResults: GuessResult[];

  // React-specific fields
  gameId: string;
  word: string;
  correctWord: string;
  fuzzyMatchPositions: number[];
  hasWon: boolean;
  showConfetti: boolean;
  showLeaderboard: boolean;
  message: Message | null;
  guessHistory: Array<{
    guess: string;
    timestamp: number;
    result: GuessResult;
  }>;
  remainingGuesses: number;
}

export interface GameAction {
  type: string;
  payload?: any;
}

export enum GameActionTypes {
  FETCH_WORD_START = 'FETCH_WORD_START',
  FETCH_WORD_SUCCESS = 'FETCH_WORD_SUCCESS',
  FETCH_WORD_FAILURE = 'FETCH_WORD_FAILURE',
  SUBMIT_GUESS = 'SUBMIT_GUESS',
  CHECK_GUESS = 'CHECK_GUESS',
  RESET_GAME = 'RESET_GAME',
  UPDATE_TIMER = 'UPDATE_TIMER',
  INCREASE_HINT_LEVEL = 'INCREASE_HINT_LEVEL',
  GAME_OVER = 'GAME_OVER'
}

export interface GameContext {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} 