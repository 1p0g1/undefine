import React, { useState, useEffect, useCallback, memo } from 'react';
import './Leaderboard.css';
import { getApiUrl } from './config';
import type { LeaderboardEntry } from '@undefine/shared-types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface LeaderboardProps {
  gameId: string;
  isGameOver: boolean;
  isCorrect: boolean;
  correctWord: string;
  onClose: () => void;
}

const LeaderboardContent = memo(({ entries, formatTime }: { 
  entries: LeaderboardEntry[], 
  formatTime: (seconds: number) => string 
}) => (
  <div className="leaderboard-list">
    {entries.map((entry, index) => (
      <div key={`${entry.username}-${index}`} className="leaderboard-entry">
        <span className="rank">#{index + 1}</span>
        <span className="username">{entry.username}</span>
        <span className="score">{entry.guessesUsed} guesses</span>
        <span className="time">{formatTime(entry.timeTaken)}</span>
      </div>
    ))}
  </div>
));

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  isGameOver,
  isCorrect,
  correctWord,
  onClose 
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const fetchWithRetry = useCallback(async (
    url: string, 
    retries: number = MAX_RETRIES
  ): Promise<LeaderboardEntry[]> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: number | undefined;

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchWithRetry(getApiUrl('/api/leaderboard/daily'));
        
        if (mounted) {
          setEntries(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        if (mounted) {
          setError('Failed to fetch leaderboard. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (isGameOver) {
      timeoutId = window.setTimeout(fetchLeaderboard, 0);
    }

    return () => {
      mounted = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isGameOver, fetchWithRetry]);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading" role="alert" aria-busy="true">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container" role="dialog" aria-label="Game Over">
      <h2>Game Over!</h2>
      
      {isCorrect ? (
        <p className="success-message" role="alert">
          Congratulations! You found the word!
        </p>
      ) : (
        <p className="game-over-message" role="alert">
          Better luck next time! The word was: {correctWord}
        </p>
      )}
      
      {error ? (
        <p className="error-message" role="alert">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </p>
      ) : entries.length > 0 ? (
        <>
          <h3>Today's Top Players</h3>
          <LeaderboardContent entries={entries} formatTime={formatTime} />
        </>
      ) : (
        <p className="no-entries">No entries yet - you could be the first!</p>
      )}
      
      <button 
        onClick={onClose} 
        className="close-button"
        aria-label="Close leaderboard"
      >
        Close
      </button>
    </div>
  );
};

export default memo(Leaderboard); 