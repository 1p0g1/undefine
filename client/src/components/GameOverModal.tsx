import React from 'react';
import { WordData } from '../types';
import HintContent from './HintContent';

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
          <HintContent 
            wordData={wordData}
            revealedHints={[0, 1, 2, 3, 4, 5]} // Show all hints in summary
            isGameOver={true}
          />
        </div>
      </div>
    </div>
  );
};

export default GameOverModal; 