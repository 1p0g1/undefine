import React from 'react';
import type { WordData } from '../types/index';

interface GameSummaryProps {
  wordData: WordData;
  isGameOver: boolean;
}

export const GameSummary: React.FC<GameSummaryProps> = ({
  wordData,
  isGameOver
}) => {
  if (!wordData || !isGameOver) return null;

  return (
    <div className="hints-container game-summary">
      <h2 className="word-title">{wordData.word}</h2>
      <div className="game-summary-content">
        <p className="definition-entry visible">
          <strong>Definition:</strong> {wordData.clues.D}
        </p>
        
        <p className="synonyms-entry visible">
          <strong>Synonyms:</strong> {wordData.clues.E2}
        </p>
        
        <p className="first-letter-entry visible">
          <strong>First Letter:</strong> {wordData.clues.F}
        </p>
        
        <p className="example-entry visible">
          <strong>Example:</strong> {wordData.clues.I}
        </p>
        
        <p className="letter-count-entry visible">
          <strong>Letter Count:</strong> {wordData.clues.N}
        </p>
        
        <p className="etymology-entry visible">
          <strong>Etymology:</strong> {wordData.clues.E}
        </p>
      </div>
    </div>
  );
};

export default GameSummary; 