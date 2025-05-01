import { useState } from 'react';
export const useGuessValidation = (correctWord) => {
    const [guessResults, setGuessResults] = useState([]);
    const validateGuess = (guess) => {
        const isCorrect = guess.toLowerCase() === correctWord.toLowerCase();
        const result = {
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
