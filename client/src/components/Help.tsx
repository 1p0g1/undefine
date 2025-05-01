import React from 'react';

interface Props {
  onClose: () => void;
}

export const Help: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">How to Play</h2>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="space-y-4">
        <section>
          <h3 className="font-bold mb-2">Game Rules</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Try to guess the word based on the given clues</li>
            <li>Each guess must be a valid word</li>
            <li>After each guess, you'll see how close you were</li>
            <li>New clues are revealed as you make more guesses</li>
            <li>Try to solve the puzzle in as few guesses as possible</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold mb-2">Clue Types</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Definition: The word's meaning</li>
            <li>Etymology: The word's origin</li>
            <li>First Letter: The first letter of the word</li>
            <li>Number of Letters: Total length of the word</li>
            <li>In a Sentence: Example usage of the word</li>
            <li>Equivalents: Similar or related words</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold mb-2">Scoring</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Points are awarded based on how quickly you solve the puzzle</li>
            <li>Fewer guesses result in a higher score</li>
            <li>Bonus points for maintaining a daily streak</li>
          </ul>
        </section>
      </div>
    </div>
  );
}; 