import React from 'react';

interface GameFooterProps {
  onNewGame: () => void;
  onShare: () => void;
}

export const GameFooter: React.FC<GameFooterProps> = ({ onNewGame, onShare }) => {
  return (
    <footer className="flex items-center justify-between p-4 bg-white shadow">
      <button
        onClick={onNewGame}
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        New Game
      </button>
      <button
        onClick={onShare}
        className="px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        Share
      </button>
    </footer>
  );
}; 