import React from 'react';

interface GameHeaderProps {
  onSettingsClick: () => void;
  onHowToPlayClick: () => void;
  onStatsClick: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  onSettingsClick,
  onHowToPlayClick,
  onStatsClick
}) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <h1 className="text-2xl font-bold text-gray-800">Un-Define</h1>
      <div className="flex gap-4">
        <button
          onClick={onHowToPlayClick}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          How to Play
        </button>
        <button
          onClick={onStatsClick}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Stats
        </button>
        <button
          onClick={onSettingsClick}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Settings
        </button>
      </div>
    </header>
  );
}; 