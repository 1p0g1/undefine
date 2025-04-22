import { useState, useCallback } from 'react';
import { GameState, WordData, HintIndex, GuessResult } from '../types/game.js';

const initialState: GameState = {
  wordData: null,
  revealedHints: [],
  guessCount: 0,
  isGameOver: false,
  hasWon: false,
  guessResults: [],
  isLoading: false
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const startNewGame = useCallback((wordData: WordData) => {
    setState({
      ...initialState,
      wordData,
      isLoading: false
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

  const submitGuess = useCallback((guess: string) => {
    setState(prev => {
      if (!prev.wordData || prev.isGameOver) {
        return prev;
      }

      const isCorrect = guess.toLowerCase() === prev.wordData.word.toLowerCase();
      const newGuessCount = prev.guessCount + 1;
      const newGuessResult: GuessResult = isCorrect ? 'correct' : 'incorrect';
      const newGuessResults = [...prev.guessResults, newGuessResult];
      const isGameOver = isCorrect || newGuessCount >= 6;

      return {
        ...prev,
        guessCount: newGuessCount,
        guessResults: newGuessResults,
        isGameOver,
        hasWon: isCorrect
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