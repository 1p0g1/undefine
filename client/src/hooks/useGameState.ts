import { useState } from 'react';
import { WordData } from '@shared/utils/word';

export interface BaseGameState {
  wordData: WordData | null;
  revealedHints: string[];
  remainingGuesses: number;
  isGameOver: boolean;
  hasWon: boolean;
  isCorrect: boolean;
  showConfetti: boolean;
  showLeaderboard: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  guessCount: number;
  gameId?: string;
  correctWord?: string;
}

const initialGameState: BaseGameState = {
  wordData: null,
  revealedHints: [],
  remainingGuesses: 6,
  isGameOver: false,
  hasWon: false,
  isCorrect: false,
  showConfetti: false,
  showLeaderboard: false,
  message: null,
  guessCount: 0
};

export function useGameState() {
  const [gameState, setGameState] = useState<BaseGameState>(initialGameState);

  return {
    gameState,
    setGameState
  };
} 