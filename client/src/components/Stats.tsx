import React from 'react';

interface Props {
  gamesPlayed: number;
  gamesWon: number;
  averageGuesses: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  onClose: () => void;
}

export const Stats: React.FC<Props> = ({
  gamesPlayed,
  gamesWon,
  averageGuesses,
  averageTime,
  currentStreak,
  longestStreak,
  onClose
}) => {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const avgTimeInSeconds = Math.round(averageTime / 1000);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Games Played</h3>
          <p className="text-2xl">{gamesPlayed}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Win Rate</h3>
          <p className="text-2xl">{winRate}%</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Current Streak</h3>
          <p className="text-2xl">{currentStreak}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Longest Streak</h3>
          <p className="text-2xl">{longestStreak}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Average Guesses</h3>
          <p className="text-2xl">{averageGuesses.toFixed(1)}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Average Time</h3>
          <p className="text-2xl">{avgTimeInSeconds}s</p>
        </div>
      </div>
    </div>
  );
}; 