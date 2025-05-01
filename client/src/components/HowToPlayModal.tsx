import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <div className="space-y-4">
          <p>
            Un-Define is a word guessing game where you try to guess a word based on its definition and other clues.
          </p>
          <h3 className="text-xl font-semibold">Game Rules:</h3>
          <ul className="list-disc pl-4 space-y-2">
            <li>You have 6 guesses to guess the correct word</li>
            <li>Each guess will show you how close you are to the correct word</li>
            <li>You can reveal hints to help you guess the word</li>
            <li>The game ends when you guess the correct word or run out of guesses</li>
          </ul>
          <h3 className="text-xl font-semibold">Hints:</h3>
          <ul className="list-disc pl-4 space-y-2">
            <li>Definition (D): The meaning of the word</li>
            <li>Etymology (E): The origin of the word</li>
            <li>First Letter (F): The first letter of the word</li>
            <li>In a Sentence (I): An example sentence using the word</li>
            <li>Number of Letters (N): The length of the word</li>
            <li>Equivalents (E2): Synonyms or similar words</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}; 