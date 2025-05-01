import React from 'react';
import type { UserStats } from '@undefine/shared-types';

interface UserStatsDisplayProps {
  stats: UserStats | null;
  loading: boolean;
}

export const UserStatsDisplay: React.FC<UserStatsDisplayProps> = ({ stats, loading }) => {
  if (loading) {
    return <div className="p-4">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="p-4">No stats available</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Games Played</p>
          <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
        </div>
        <div>
          <p className="text-gray-600">Games Won</p>
          <p className="text-2xl font-bold">{stats.gamesWon}</p>
        </div>
        <div>
          <p className="text-gray-600">Win Rate</p>
          <p className="text-2xl font-bold">
            {((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-600">Average Guesses</p>
          <p className="text-2xl font-bold">{stats.averageGuesses.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}; 