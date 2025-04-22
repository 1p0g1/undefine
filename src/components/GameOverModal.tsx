import React from 'react';
import { WordData } from '../types/game.js';
import DefineHints from './DefineHints.js';
import './GameOverModal.css';

interface GameOverModalProps {
  isOpen: boolean;
  wordData: WordData;
  isCorrect: boolean;
  onClose?: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, wordData, isCorrect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="word-title">{wordData.word}</h2>
          {onClose && (
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="modal-body">
          <p className="game-result">
            {isCorrect ? 'Congratulations! You got it!' : 'Better luck next time!'}
          </p>
          <DefineHints 
            word={wordData}
            revealedHints={[0, 1, 2, 3, 4, 5]} // Show all hints in summary
            guessCount={6}
          />
        </div>
      </div>
    </div>
  );
};

export default GameOverModal; 