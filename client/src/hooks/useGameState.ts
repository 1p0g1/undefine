import { useState, useCallback } from 'react';
import type { GameState, WordData, HintIndex, GuessResult } from '@undefine/shared-types';

const initialState: GameState = {
  wordData: null,
  guesses: [],
  isCorrect: false,
  isGameOver: false,
  loading: true,
  error: undefined,
  timer: 0,
  hintLevel: 0,
  revealedHints: [],
  guessCount: 0,
  guessResults: []
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const startNewGame = useCallback((wordData: WordData) => {
    setState({
      ...initialState,
      wordData,
      loading: false
    });
  }, []);

  const revealHint = useCallback((hintIndex: HintIndex) => {
    setState(prev => {
      if (prev.isGameOver || prev.revealedHints.includes(hintIndex)) {
        return prev;
      }
      return {
        ...prev,
        revealedHints: [...prev.revealedHints, hintIndex]
      };
    });
  }, []);

  const submitGuess = useCallback((guess: string, result: GuessResult) => {
    setState(prev => {
      if (!prev.wordData || prev.isGameOver) {
        return prev;
      }

      return {
        ...prev,
        guesses: [...prev.guesses, guess],
        guessCount: prev.guessCount + 1,
        guessResults: [...prev.guessResults, result],
        isCorrect: result.isCorrect,
        isGameOver: result.gameOver
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    startNewGame,
    revealHint,
    submitGuess,
    resetGame
  };
} 