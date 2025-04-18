import React from 'react';
import './HintContent.css';

// Define WordData interface here instead of importing it
interface WordData {
  id: string;
  word: string;
  clues: {
    D: string;  // Definition
    E: string;  // Etymology
    F: string;  // First letter
    I: string;  // In a sentence
    N: number;  // Number of letters
    E2: string[];  // Equivalents/synonyms
  };
}

interface HintContentProps {
  wordData: WordData;
  revealedHints: number[];
  isGameOver?: boolean;
}

const HintContent: React.FC<HintContentProps> = ({ wordData, revealedHints, isGameOver = false }) => {
  if (!wordData) return null;

  // Full-width hints (Definition and Example)
  const fullWidthHints = (
    <>
      <div className="hint-item hint-full">
        <strong>Definition:</strong>
        <p>{wordData.clues.D}</p>
      </div>
      {(revealedHints.includes(3) || isGameOver) && (
        <div className="hint-item hint-full">
          <strong>Example:</strong>
          <p>{wordData.clues.I}</p>
        </div>
      )}
    </>
  );

  // Grid hints (Etymology, First Letter, Number of Letters, Synonyms)
  const gridHints = (
    <div className="hints-grid">
      {(revealedHints.includes(1) || isGameOver) && (
        <div className="hint-item">
          <strong>Etymology:</strong>
          <p>{wordData.clues.E}</p>
        </div>
      )}
      {(revealedHints.includes(2) || isGameOver) && (
        <div className="hint-item">
          <strong>First Letter:</strong>
          <p>{wordData.clues.F}</p>
        </div>
      )}
      {(revealedHints.includes(4) || isGameOver) && (
        <div className="hint-item">
          <strong>Letters:</strong>
          <p>{wordData.clues.N}</p>
        </div>
      )}
      {(revealedHints.includes(5) || isGameOver) && (
        <div className="hint-item">
          <strong>Synonyms:</strong>
          <p>{wordData.clues.E2.join(', ')}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`hints-container ${isGameOver ? 'game-over' : ''}`}>
      <h3 className="section-title">
        {isGameOver ? 'Word Details' : 'Available Hints'}
      </h3>
      <div className="hints-content">
        {fullWidthHints}
        {gridHints}
      </div>
    </div>
  );
};

export default HintContent;