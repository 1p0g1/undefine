import React from 'react';
import type { UserStats } from '@undefine/shared-types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats | null;
  loading: boolean;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
        {loading ? (
          <div className="text-center py-4">Loading stats...</div>
        ) : !stats ? (
          <div className="text-center py-4">No stats available</div>
        ) : (
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
        )}
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}; 