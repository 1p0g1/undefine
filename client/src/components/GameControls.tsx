import React from 'react';

interface GameControlsProps {
  onHint: () => void;
  onSkip: () => void;
  hintAvailable: boolean;
  skipAvailable: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onHint,
  onSkip,
  hintAvailable,
  skipAvailable
}) => {
  return (
    <div className="flex gap-4 p-4">
      <button
        onClick={onHint}
        disabled={!hintAvailable}
        className="px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
      >
        Get Hint
      </button>
      <button
        onClick={onSkip}
        disabled={!skipAvailable}
        className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        Skip Word
      </button>
    </div>
  );
}; 