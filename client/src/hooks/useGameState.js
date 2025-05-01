import { useState, useCallback } from 'react';
const initialState = {
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
    const [state, setState] = useState(initialState);
    const startNewGame = useCallback((wordData) => {
        setState({
            ...initialState,
            wordData,
            loading: false
        });
    }, []);
    const revealHint = useCallback((hintIndex) => {
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
    const submitGuess = useCallback((guess, result) => {
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
