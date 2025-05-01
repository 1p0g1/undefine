import React, { useState } from 'react';
import type { GuessResult } from '@undefine/shared-types';

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
  maxLength?: number;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onGuess, disabled, maxLength = 20 }) => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onGuess(guess.trim());
      setGuess('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your guess..."
      />
      <button
        type="submit"
        disabled={disabled || !guess.trim()}
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        Guess
      </button>
    </form>
  );
}; 