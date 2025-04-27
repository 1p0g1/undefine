import React from 'react';
import { HintIndex, HINT_INDICES, GuessResult } from '@undefine/shared-types';

interface DefineBoxesProps {
  revealedHints: HintIndex[];
  onHintReveal: (hint: HintIndex) => void;
  isGameOver: boolean;
  isCorrect: boolean;
  guessCount: number;
  guessResults: GuessResult[];
}

const DefineBoxes: React.FC<DefineBoxesProps> = ({
  revealedHints,
  onHintReveal,
  isGameOver,
  isCorrect,
  guessCount,
  guessResults,
}) => {
  const defineLetters = Object.values(HINT_INDICES) as HintIndex[];
  
  return (
    <div className="define-boxes-container">
      <span className="un-prefix">Un ·</span>
      <div className="define-boxes">
        {defineLetters.map((letter, index) => {
          let boxClass = 'define-box';
          
          // Only highlight the correct box for the winning guess
          if (isCorrect && index === guessResults.length - 1) {
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

export default DefineBoxes; 