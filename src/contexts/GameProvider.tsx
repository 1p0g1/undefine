import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { GameState, GameAction, GameContext as GameContextType, GameStats } from '../config/types.js';
import type { Word, LeaderboardEntry } from '@shared-types/index.js';
import { useDatabase } from './DatabaseProvider.js';
import { calculateFuzzyMatch } from '../utils/calculateFuzzyMatch.js';

const initialState: GameState = {
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

const GameContext = createContext<GameContextType>({
  state: initialState,
  dispatch: () => {}
});

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        word: action.payload,
        startTime: Date.now(),
        error: null
      };
    case 'MAKE_GUESS':
      if (!state.word || state.isComplete) return state;

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

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const user = { username: 'anonymous' };
  const { db } = useDatabase();

  const getGameStats = useCallback((): GameStats | null => {
    if (!state.isComplete || !state.startTime || !state.endTime) return null;

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
      const entry: LeaderboardEntry = {
        username: user.username || 'anonymous',
        wordId: state.word.id,
        word: state.word.word,
        timeTaken: stats.timeTaken,
        guessesUsed: stats.guessesUsed,
        score: 100 - (stats.guessesUsed * 10),
        rank: 0 // Will be calculated by the database
      };

      db.addLeaderboardEntry(entry);
      db.updateUserStats(user.username || 'anonymous', state.isWon, stats.guessesUsed, stats.timeTaken);
      db.markAsUsed(state.word.id);
    }
  }, [state.isComplete]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 