import { LeaderboardEntry } from '@undefine/shared-types';
import { useState, useEffect } from 'react';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setEntries(data.entries);
        setIsLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <button onClick={onClose}>Close</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          Loading...
        </div>
      ) : (
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
      )}
    </div>
  );
} 