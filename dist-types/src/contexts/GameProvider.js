import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useDatabase } from './DatabaseProvider.js';
import { calculateFuzzyMatch } from '../utils/calculateFuzzyMatch.js';
const initialState = {
    word: null,
    guesses: [],
    fuzzyMatches: 0,
    hintsUsed: 0,
    startTime: null,
    endTime: null,
    isComplete: false,
    isWon: false,
    error: null
};
const GameContext = createContext({
    state: initialState,
    dispatch: () => { }
});
function gameReducer(state, action) {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...initialState,
                word: action.payload,
                startTime: Date.now(),
                error: null
            };
        case 'MAKE_GUESS':
            if (!state.word || state.isComplete)
                return state;
            const guess = action.payload.toLowerCase();
            const fuzzyMatch = calculateFuzzyMatch(guess, state.word.definition);
            const isCorrect = guess === state.word.word.toLowerCase();
            if (isCorrect) {
                return {
                    ...state,
                    guesses: [...state.guesses, guess],
                    isComplete: true,
                    isWon: true,
                    endTime: Date.now()
                };
            }
            return {
                ...state,
                guesses: [...state.guesses, guess],
                fuzzyMatches: fuzzyMatch ? state.fuzzyMatches + 1 : state.fuzzyMatches
            };
        case 'USE_HINT':
            return {
                ...state,
                hintsUsed: state.hintsUsed + 1
            };
        case 'END_GAME':
            return {
                ...state,
                isComplete: true,
                isWon: action.payload.isWon,
                endTime: Date.now()
            };
        case 'RESET_GAME':
            return initialState;
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
}
export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const user = { username: 'anonymous' };
    const { db } = useDatabase();
    const getGameStats = useCallback(() => {
        if (!state.isComplete || !state.startTime || !state.endTime)
            return null;
        return {
            timeTaken: state.endTime - state.startTime,
            guessesUsed: state.guesses.length,
            fuzzyMatches: state.fuzzyMatches,
            hintsUsed: state.hintsUsed,
            isWon: state.isWon
        };
    }, [state]);
    useEffect(() => {
        const stats = getGameStats();
        if (stats && state.word && user) {
            db.addLeaderboardEntry({
                username: user.username || 'anonymous',
                wordId: state.word.id,
                word: state.word.word,
                timeTaken: stats.timeTaken,
                guessesUsed: stats.guessesUsed,
                fuzzyMatches: stats.fuzzyMatches,
                hintsUsed: stats.hintsUsed
            });
            db.updateUserStats(user.username || 'anonymous');
            db.markAsUsed(state.word.id);
        }
    }, [state.isComplete]);
    return (_jsx(GameContext.Provider, { value: { state, dispatch }, children: children }));
}
export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
