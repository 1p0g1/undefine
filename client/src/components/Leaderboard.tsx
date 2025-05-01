import React from 'react';
import type { LeaderboardEntry } from '@undefine/shared-types';

interface Props {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  gameId?: string;
  isGameOver?: boolean;
  isCorrect?: boolean;
  correctWord?: string;
  severity?: string;
}

export const Leaderboard: React.FC<Props> = ({ 
  entries, 
  loading, 
  error, 
  onClose,
  gameId,
  isGameOver,
  isCorrect,
  correctWord,
  severity
}) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center p-8">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="p-4">
        <p>No entries found</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Word</th>
            <th>Guesses</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.username}-${entry.wordId}`}>
              <td>{entry.rank}</td>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
              <td>{entry.word}</td>
              <td>{entry.guessesUsed}</td>
              <td>{Math.round(entry.timeTaken / 1000)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 