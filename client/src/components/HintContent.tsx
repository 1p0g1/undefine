import React, { useEffect } from 'react';
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

// Enable debug mode to force all clues visible
const DEBUG_MODE = true;

const HintContent: React.FC<HintContentProps> = ({ wordData, revealedHints, isGameOver = false }) => {
  if (!wordData) return null;

  // Add debugging log
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('[DEBUG] HintContent rendering with:', {
        wordData,
        revealedHints,
        isGameOver,
        clues: wordData.clues
      });
    }
  }, [wordData, revealedHints, isGameOver]);

  // Full-width hints (Definition and Example)
  const fullWidthHints = (
    <>
      <div className="hint-item hint-full" style={{ opacity: 1, color: 'black', fontWeight: 'normal' }}>
        <strong style={{ color: 'black', display: 'block', marginBottom: '8px' }}>Definition:</strong>
        <p style={{ color: 'black', margin: 0 }}>{wordData.clues.D}</p>
      </div>
      {(DEBUG_MODE || revealedHints.includes(3) || isGameOver) && (
        <div className="hint-item hint-full" style={{ opacity: 1, color: 'black', fontWeight: 'normal' }}>
          <strong style={{ color: 'black', display: 'block', marginBottom: '8px' }}>Example:</strong>
          <p style={{ color: 'black', margin: 0 }}>{wordData.clues.I}</p>
        </div>
      )}
    </>
  );

  // Grid hints (Etymology, First Letter, Number of Letters, Synonyms)
  const gridHints = (
    <div className="hints-grid">
      {(DEBUG_MODE || revealedHints.includes(1) || isGameOver) && (
        <div className="hint-item" style={{ opacity: 1, color: 'black', fontWeight: 'normal' }}>
          <strong style={{ color: 'black', display: 'block', marginBottom: '8px' }}>Etymology:</strong>
          <p style={{ color: 'black', margin: 0 }}>{wordData.clues.E}</p>
        </div>
      )}
      {(DEBUG_MODE || revealedHints.includes(2) || isGameOver) && (
        <div className="hint-item" style={{ opacity: 1, color: 'black', fontWeight: 'normal' }}>
          <strong style={{ color: 'black', display: 'block', marginBottom: '8px' }}>First Letter:</strong>
          <p style={{ color: 'black', margin: 0 }}>{wordData.clues.F}</p>
        </div>
      )}
      {(DEBUG_MODE || revealedHints.includes(4) || isGameOver) && (
        <div className="hint-item" style={{ opacity: 1, color: 'black', fontWeight: 'normal' }}>
          <strong style={{ color: 'black', display: 'block', marginBottom: '8px' }}>Letters:</strong>
          <p style={{ color: 'black', margin: 0 }}>{wordData.clues.N}</p>
        </div>
      )}
      {(DEBUG_MODE || revealedHints.includes(5) || isGameOver) && (
        <div className="hint-item" style={{ opacity: 1, color: 'black', fontWeight: 'normal' }}>
          <strong style={{ color: 'black', display: 'block', marginBottom: '8px' }}>Synonyms:</strong>
          <p style={{ color: 'black', margin: 0 }}>{Array.isArray(wordData.clues.E2) 
            ? wordData.clues.E2.join(', ') 
            : 'No synonyms available'}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`hints-container ${isGameOver ? 'game-over' : ''}`} style={{ border: DEBUG_MODE ? '2px solid red' : undefined }}>
      <h3 className="section-title" style={{ color: 'black' }}>
        {DEBUG_MODE ? '🔍 DEBUG: All Clues' : (isGameOver ? 'Word Details' : 'Available Hints')}
      </h3>
      {DEBUG_MODE && (
        <div style={{ background: '#ffeb3b', padding: '8px', marginBottom: '10px', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
          Debug Mode: Showing all clues regardless of reveal status
        </div>
      )}
      <div className="hints-content">
        {fullWidthHints}
        {gridHints}
      </div>
    </div>
  );
};

export default HintContent;