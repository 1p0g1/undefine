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
  // IMPORTANT: Added debug logging for data presence
  useEffect(() => {
    console.log('[DEBUG-CRITICAL] HintContent.tsx - Component Mounted');
    console.log('[DEBUG-CRITICAL] wordData:', wordData);
    console.log('[DEBUG-CRITICAL] revealedHints:', revealedHints);
    console.log('[DEBUG-CRITICAL] isGameOver:', isGameOver);
    console.log('[DEBUG-CRITICAL] DEBUG_MODE:', DEBUG_MODE);
    console.log('[DEBUG-CRITICAL] DEBUG_CONFIG:', DEBUG_CONFIG);
    
    if (wordData) {
      console.log('[DEBUG-CRITICAL] wordData.clues:', wordData.clues);
      console.log('[DEBUG-CRITICAL] Definition:', wordData.clues.D);
    } else {
      console.error('[DEBUG-CRITICAL] wordData is null or undefined');
    }
  }, [wordData, revealedHints, isGameOver]);

  // IMPORTANT: Early data validation with detailed logging
  if (!wordData) {
    console.error('[DEBUG-CRITICAL] HintContent returning null - wordData is missing');
    return <div className="error-box" style={{padding: '10px', color: 'red', border: '1px solid red'}}>No word data available</div>;
  }
  
  if (!wordData.clues) {
    console.error('[DEBUG-CRITICAL] HintContent - wordData.clues is missing');
    return <div className="error-box" style={{padding: '10px', color: 'red', border: '1px solid red'}}>Word data has no clues</div>;
  }

  // IMPORTANT: Force all styles to be visible for debugging
  const debugStyle = {
    opacity: 1,
    color: 'black', 
    fontWeight: 'normal',
    border: '1px dashed blue',
    display: 'block'
  } as React.CSSProperties;
  
  // Full-width hints (Definition and Example) - FORCING ALL TO SHOW
  const fullWidthHints = (
    <>
      <div className="hint-item hint-full" style={debugStyle}>
        <strong style={debugStyle}>Definition:</strong>
        <p style={debugStyle}>{wordData.clues.D || 'No definition available'}</p>
      </div>
      {/* IMPORTANT: Removed conditional rendering for debugging */}
      <div className="hint-item hint-full" style={debugStyle}>
        <strong style={debugStyle}>Example:</strong>
        <p style={debugStyle}>{wordData.clues.I || 'No example available'}</p>
      </div>
    </>
  );

  // Grid hints - FORCING ALL TO SHOW
  const gridHints = (
    <div className="hints-grid">
      {/* IMPORTANT: Removed conditional rendering for debugging */}
      <div className="hint-item" style={debugStyle}>
        <strong style={debugStyle}>Etymology:</strong>
        <p style={debugStyle}>{wordData.clues.E || 'No etymology available'}</p>
      </div>
      <div className="hint-item" style={debugStyle}>
        <strong style={debugStyle}>First Letter:</strong>
        <p style={debugStyle}>{wordData.clues.F || 'No first letter available'}</p>
      </div>
      <div className="hint-item" style={debugStyle}>
        <strong style={debugStyle}>Letters:</strong>
        <p style={debugStyle}>{wordData.clues.N || 'No letter count available'}</p>
      </div>
      <div className="hint-item" style={debugStyle}>
        <strong style={debugStyle}>Synonyms:</strong>
        <p style={debugStyle}>{Array.isArray(wordData.clues.E2) && wordData.clues.E2.length > 0
          ? wordData.clues.E2.join(', ') 
          : 'No synonyms available'}</p>
      </div>
    </div>
  );

  return (
    <div className="hints-container" style={{ 
      border: '2px solid red',
      padding: '10px',
      margin: '10px 0',
      backgroundColor: '#f8f8f8'
    }}>
      <h3 className="section-title" style={{ color: 'darkred' }}>
        DEBUG: All Clues Forced Visible
      </h3>
      <div style={{ background: '#ffeb3b', padding: '8px', marginBottom: '10px', color: 'black', textAlign: 'center', fontWeight: 'bold' }}>
        Debug Mode: Forcing all clues to show
      </div>
      <div className="hints-content">
        {fullWidthHints}
        {gridHints}
      </div>
    </div>
  );
};

export default HintContent;