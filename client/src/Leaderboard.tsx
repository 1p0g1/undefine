import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import { getApiUrl } from './config';
import { useLocalGameState } from './hooks/useLocalGameState';

interface LeaderboardEntry {
  username: string;
  time: number;
  guessCount: number;
  fuzzyCount: number;
  hintCount: number;
  word: string;
  createdAt: string;
}

interface LeaderboardProps {
  gameId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: gameState } = useLocalGameState();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/leaderboard/${gameId}`));
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchLeaderboard();
    }
  }, [gameId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="leaderboard-error">{error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>Today's Leaderboard</h2>
      </div>

      <div className="leaderboard-stats">
        <div className="stat">
          <span className="stat-label">Current Streak:</span>
          <span className="stat-value">{gameState.currentStreak}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Longest Streak:</span>
          <span className="stat-value">{gameState.longestStreak}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Games Played:</span>
          <span className="stat-value">{gameState.gamesPlayed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Games Won:</span>
          <span className="stat-value">{gameState.gamesWon}</span>
        </div>
      </div>

      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Time</th>
              <th>Guesses</th>
              <th>Fuzzy</th>
              <th>Hints</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className={entry.username === gameState.nickname ? 'current-user' : ''}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{formatTime(entry.time)}</td>
                <td>{entry.guessCount}</td>
                <td>{entry.fuzzyCount}</td>
                <td>{entry.hintCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard; 