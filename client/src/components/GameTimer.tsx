import React from 'react';

interface GameTimerProps {
  time: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  time,
  isRunning,
  onStart,
  onStop,
  onReset
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="text-2xl font-bold">{formatTime(time)}</div>
      <div className="flex gap-2">
        {isRunning ? (
          <button
            onClick={onStop}
            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            Start
          </button>
        )}
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Reset
        </button>
      </div>
    </div>
  );
}; 