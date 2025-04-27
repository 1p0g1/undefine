import React, { useEffect } from 'react';
import { HintIndex, GuessResult, WordClues } from '@undefine/shared-types';
import { DEBUG_CONFIG } from '../config/debug.js';
import './HintContent.css';

interface HintContentProps {
  wordData: WordClues | null;
  revealedHints: HintIndex[];
  onHintReveal: (hint: HintIndex) => void;
  isGameOver: boolean;
  isCorrect: boolean;
  guessCount: number;
  guessResults: GuessResult[];
}

const HintContent: React.FC<HintContentProps> = ({
  wordData,
  revealedHints,
  onHintReveal,
  isGameOver,
  isCorrect,
  guessCount,
  guessResults,
}) => {
  useEffect(() => {
    if (DEBUG_CONFIG.verboseLogging) {
      console.log('HintContent mounted with:', {
        wordData,
        revealedHints,
        isGameOver
      });
    }
  }, [wordData, revealedHints, isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      // Reveal all hints when game is over
      revealedHints.forEach(hint => onHintReveal(hint));
    }
  }, [isGameOver, revealedHints, onHintReveal]);

  if (!wordData) {
    return <div className="error">Error: Invalid word data</div>;
  }

  return (
    <div className="hints-container">
      <div className="hints-content">
        <p className={`definition-entry ${revealedHints.includes(0) ? 'visible' : ''}`}>
          <strong>Definition:</strong> {wordData.D}
        </p>
        
        <p className={`etymology-entry ${revealedHints.includes(1) ? 'visible' : ''}`}>
          <strong>Etymology:</strong> {wordData.E}
        </p>
        
        <p className={`first-letter-entry ${revealedHints.includes(2) ? 'visible' : ''}`}>
          <strong>First Letter:</strong> {wordData.F}
        </p>
        
        <p className={`example-entry ${revealedHints.includes(3) ? 'visible' : ''}`}>
          <strong>Example:</strong> {wordData.I}
        </p>
        
        <p className={`letter-count-entry ${revealedHints.includes(4) ? 'visible' : ''}`}>
          <strong>Letter Count:</strong> {wordData.N}
        </p>
        
        <p className={`synonyms-entry ${revealedHints.includes(5) ? 'visible' : ''}`}>
          <strong>Synonyms:</strong> {wordData.E2}
        </p>
      </div>
    </div>
  );
};

export default HintContent;