import React from 'react';
import type { LeaderboardEntry } from '@undefine/shared-types';

interface Props {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

const LeaderboardDisplay: React.FC<Props> = ({ entries, loading, error }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!entries.length) {
    return <div>No entries found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Score</th>
            <th className="px-4 py-2">Guesses</th>
            <th className="px-4 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.username}-${entry.wordId}`} className="border-b">
              <td className="px-4 py-2">{entry.rank}</td>
              <td className="px-4 py-2">{entry.username}</td>
              <td className="px-4 py-2">{entry.score}</td>
              <td className="px-4 py-2">{entry.guessesUsed}</td>
              <td className="px-4 py-2">{Math.round(entry.timeTaken / 1000)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardDisplay; 