import { getSynonyms, isWordData, type WordData, type HintIndex, HINT_INDICES } from '@undefine/shared-types';
import React, { useEffect } from 'react';
import { DEBUG_CONFIG } from '../config/debug.js';
import './HintContent.css';

interface HintContentProps {
  wordData: WordData;
  revealedHints: HintIndex[];
  onHintReveal: (hint: HintIndex) => void;
  isGameOver: boolean;
  hasWon: boolean;
  guessResults: ('correct' | 'incorrect' | null)[];
}

export const HintContent: React.FC<HintContentProps> = ({ 
  wordData, 
  revealedHints, 
  onHintReveal,
  isGameOver,
  hasWon,
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

  // Early validation
  if (!isWordData(wordData)) {
    console.error('Invalid word data structure:', wordData);
    return <div className="error">Error: Invalid word data</div>;
  }

  if (!wordData.clues) {
    console.error('Missing clues in word data:', wordData);
    return <div className="error">Error: Missing clues</div>;
  }

  const synonyms = getSynonyms(wordData.clues.E2);

  const hintLetters = Object.values(HINT_INDICES);
  
  return (
    <div className="hint-content-container">
      <div className="hint-content">
        {hintLetters.map((letter, index) => {
          let boxClass = 'hint-box';
          
          // Only highlight the correct box for the winning guess
          if (hasWon && index === guessResults.length - 1) {
            boxClass += ' correct';
          }
          // Show incorrect for past guesses
          else if (index < guessResults.length) {
            boxClass += ' incorrect';
          }
          // Show hint revealed state for current guess
          else if (index === guessResults.length && revealedHints.includes(letter)) {
            boxClass += ' hint-revealed';
          }
          
          return (
            <div
              key={letter}
              className={boxClass}
              onClick={() => onHintReveal(letter)}
            >
              {Object.keys(HINT_INDICES)[letter]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HintContent;