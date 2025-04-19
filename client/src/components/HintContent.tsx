import React, { useEffect } from 'react';
import './HintContent.css';
import { DEBUG_MODE, DEBUG_CONFIG } from '../config/debug';
import { WordData, getSynonyms } from '@shared/utils/word';
import { HINT_INDICES } from '../types/index';

interface HintContentProps {
  wordData: WordData;
  revealedHints: number[];
  isGameOver?: boolean;
}

const HintContent: React.FC<HintContentProps> = ({ wordData, revealedHints, isGameOver = false }) => {
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('[DEBUG-CRITICAL] HintContent.tsx - Component Mounted');
      console.log('[DEBUG-CRITICAL] wordData:', wordData);
      console.log('[DEBUG-CRITICAL] revealedHints:', revealedHints);
      console.log('[DEBUG-CRITICAL] isGameOver:', isGameOver);
      console.log('[DEBUG-CRITICAL] DEBUG_CONFIG:', DEBUG_CONFIG);
    }
  }, [wordData, revealedHints, isGameOver]);

  if (!wordData) {
    console.error('[DEBUG-CRITICAL] HintContent returning null - wordData is missing');
    return <div className="error-box">No word data available</div>;
  }

  if (!wordData.clues) {
    console.error('[DEBUG-CRITICAL] HintContent - wordData.clues is missing');
    return <div className="error-box">Word data has no clues</div>;
  }

  const fullWidthHints = (
    <>
      <div className={`hint-item hint-full ${revealedHints.includes(HINT_INDICES.D) ? 'revealed' : ''}`}>
        <strong>Definition:</strong>
        <p>{wordData.clues.D || 'No definition available'}</p>
      </div>
      <div className={`hint-item hint-full ${revealedHints.includes(HINT_INDICES.I) ? 'revealed' : ''}`}>
        <strong>Example:</strong>
        <p>{wordData.clues.I || 'No example available'}</p>
      </div>
    </>
  );

  const synonyms = getSynonyms(wordData.clues.E2);

  const gridHints = (
    <div className="hints-grid">
      <div className={`hint-item ${revealedHints.includes(HINT_INDICES.E) ? 'revealed' : ''}`}>
        <strong>Etymology:</strong>
        <p>{wordData.clues.E || 'No etymology available'}</p>
      </div>
      <div className={`hint-item ${revealedHints.includes(HINT_INDICES.F) ? 'revealed' : ''}`}>
        <strong>First Letter:</strong>
        <p>{wordData.clues.F || 'No first letter available'}</p>
      </div>
      <div className={`hint-item ${revealedHints.includes(HINT_INDICES.N) ? 'revealed' : ''}`}>
        <strong>Letters:</strong>
        <p>{wordData.clues.N || 'No letter count available'}</p>
      </div>
      <div className={`hint-item ${revealedHints.includes(HINT_INDICES.E2) ? 'revealed' : ''}`}>
        <strong>Synonyms:</strong>
        <p>
          {synonyms.length > 0
            ? synonyms.join(', ')
            : 'No synonyms available'}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`hints-container ${isGameOver ? 'game-over' : ''}`}>
      <h3 className="section-title">Available Clues</h3>
      <div className="hints-content">
        {fullWidthHints}
        {gridHints}
      </div>
    </div>
  );
};

export default HintContent;