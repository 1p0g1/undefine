import React from 'react';
import './GameOverModal.css';
import type { WordClues } from '@undefine/shared-types';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCorrect: boolean;
  wordData: WordClues | null;
  correctWord: string;
  guessCount: number;
  timeTaken: number;
  onPlayAgain: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  isCorrect,
  wordData,
  correctWord,
  guessCount,
  timeTaken,
  onPlayAgain
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isCorrect ? 'Congratulations!' : 'Game Over'}</h2>
        <p>
          {isCorrect
            ? `You won in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`
            : `The word was: ${correctWord}`}
        </p>
        <p>Time taken: {timeTaken} seconds</p>
        <div className="modal-buttons">
          <button onClick={onPlayAgain}>Play Again</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal; 