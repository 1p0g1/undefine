import React, { useEffect } from 'react';
import './HintContent.css';
import { DEBUG_MODE, DEBUG_CONFIG } from '../config/debug';

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

  // Add debugging log
  useEffect(() => {
    if (DEBUG_CONFIG.verboseLogging) {
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
      <div className="hint-item hint-full" style={DEBUG_CONFIG.forceShowAllClues ? { opacity: 1, color: 'black', fontWeight: 'normal' } : undefined}>
        <strong style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', display: 'block', marginBottom: '8px' } : undefined}>Definition:</strong>
        <p style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', margin: 0 } : undefined}>{wordData.clues.D}</p>
      </div>
      {(DEBUG_CONFIG.forceShowAllClues || revealedHints.includes(3) || isGameOver) && (
        <div className="hint-item hint-full" style={DEBUG_CONFIG.forceShowAllClues ? { opacity: 1, color: 'black', fontWeight: 'normal' } : undefined}>
          <strong style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', display: 'block', marginBottom: '8px' } : undefined}>Example:</strong>
          <p style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', margin: 0 } : undefined}>{wordData.clues.I}</p>
        </div>
      )}
    </>
  );

  // Grid hints (Etymology, First Letter, Number of Letters, Synonyms)
  const gridHints = (
    <div className="hints-grid">
      {(DEBUG_CONFIG.forceShowAllClues || revealedHints.includes(1) || isGameOver) && (
        <div className="hint-item" style={DEBUG_CONFIG.forceShowAllClues ? { opacity: 1, color: 'black', fontWeight: 'normal' } : undefined}>
          <strong style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', display: 'block', marginBottom: '8px' } : undefined}>Etymology:</strong>
          <p style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', margin: 0 } : undefined}>{wordData.clues.E}</p>
        </div>
      )}
      {(DEBUG_CONFIG.forceShowAllClues || revealedHints.includes(2) || isGameOver) && (
        <div className="hint-item" style={DEBUG_CONFIG.forceShowAllClues ? { opacity: 1, color: 'black', fontWeight: 'normal' } : undefined}>
          <strong style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', display: 'block', marginBottom: '8px' } : undefined}>First Letter:</strong>
          <p style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', margin: 0 } : undefined}>{wordData.clues.F}</p>
        </div>
      )}
      {(DEBUG_CONFIG.forceShowAllClues || revealedHints.includes(4) || isGameOver) && (
        <div className="hint-item" style={DEBUG_CONFIG.forceShowAllClues ? { opacity: 1, color: 'black', fontWeight: 'normal' } : undefined}>
          <strong style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', display: 'block', marginBottom: '8px' } : undefined}>Letters:</strong>
          <p style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', margin: 0 } : undefined}>{wordData.clues.N}</p>
        </div>
      )}
      {(DEBUG_CONFIG.forceShowAllClues || revealedHints.includes(5) || isGameOver) && (
        <div className="hint-item" style={DEBUG_CONFIG.forceShowAllClues ? { opacity: 1, color: 'black', fontWeight: 'normal' } : undefined}>
          <strong style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', display: 'block', marginBottom: '8px' } : undefined}>Synonyms:</strong>
          <p style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black', margin: 0 } : undefined}>{Array.isArray(wordData.clues.E2) 
            ? wordData.clues.E2.join(', ') 
            : 'No synonyms available'}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`hints-container ${isGameOver ? 'game-over' : ''}`} style={{ border: DEBUG_CONFIG.showDebugBanner ? '2px solid red' : undefined }}>
      <h3 className="section-title" style={DEBUG_CONFIG.forceShowAllClues ? { color: 'black' } : undefined}>
        {DEBUG_CONFIG.showDebugBanner ? '🔍 DEBUG: All Clues' : (isGameOver ? 'Word Details' : 'Available Hints')}
      </h3>
      {DEBUG_CONFIG.showDebugBanner && (
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