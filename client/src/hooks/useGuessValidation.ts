import { useState } from 'react';
import type { GuessResult } from '@undefine/shared-types';

export const useGuessValidation = (correctWord: string) => {
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);

  const validateGuess = (guess: string): GuessResult => {
    const isCorrect = guess.toLowerCase() === correctWord.toLowerCase();
    const result: GuessResult = {
      isCorrect,
      guess,
      isFuzzy: false,
      fuzzyPositions: [],
      gameOver: isCorrect
    };

    setGuessResults((prev) => [...prev, result]);
    return result;
  };

  return { guessResults, validateGuess };
}; 