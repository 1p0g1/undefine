import { useState, useEffect } from 'react';

interface LocalGameState {
  nickname: string | null;
  currentStreak: number;
  longestStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayedDate: string | null;
}

const DEFAULT_STATE: LocalGameState = {
  nickname: null,
  currentStreak: 0,
  longestStreak: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  lastPlayedDate: null
};

export function useLocalGameState() {
  const [state, setState] = useState<LocalGameState>(() => {
    const savedState = localStorage.getItem('gameState');
    return savedState ? JSON.parse(savedState) : DEFAULT_STATE;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  const updateGameStats = (isWon: boolean, guessesUsed: number, timeTaken: number) => {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = state.lastPlayedDate;
    
    setState(prev => {
      const newState = { ...prev };
      
      // Update games played and won
      newState.gamesPlayed++;
      if (isWon) {
        newState.gamesWon++;
      }
      
      // Update streak
      if (lastPlayed === today) {
        // Already played today, no streak update needed
      } else if (lastPlayed === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        // Played yesterday, increment streak if won
        if (isWon) {
          newState.currentStreak++;
          if (newState.currentStreak > newState.longestStreak) {
            newState.longestStreak = newState.currentStreak;
          }
        } else {
          newState.currentStreak = 0;
        }
      } else {
        // Didn't play yesterday, reset streak
        newState.currentStreak = isWon ? 1 : 0;
      }
      
      // Update last played date
      newState.lastPlayedDate = today;
      
      return newState;
    });
  };

  const hasPlayedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.lastPlayedDate === today;
  };

  const setNickname = (nickname: string) => {
    setState(prev => ({ ...prev, nickname }));
  };

  return {
    state,
    updateGameStats,
    hasPlayedToday,
    setNickname
  };
} 