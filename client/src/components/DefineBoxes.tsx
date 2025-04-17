import React from 'react';
import { HINT_INDICES } from '../types/index';

interface DefineBoxesProps {
  isCorrect: boolean;
  guessCount: number;
  revealedHints: number[];
  guessResults: ('correct' | 'incorrect' | null)[];
}

export const DefineBoxes: React.FC<DefineBoxesProps> = ({
  isCorrect,
  guessCount,
  revealedHints,
  guessResults
}) => {
  const defineLetters = ['D', 'E', 'F', 'I', 'N', 'E'];
  
  return (
    <div className="define-boxes-container">
      <span className="un-prefix">Un ·</span>
      <div className="define-boxes">
        {defineLetters.map((letter, index) => {
          let boxClass = 'define-box';
          
          // Only highlight the correct box for the winning guess
          if (isCorrect && index === guessCount - 1) {
            boxClass += ' correct';
          }
          // Show incorrect for past guesses
          else if (index < guessCount) {
            boxClass += ' incorrect';
          }
          // Show hint revealed state for current guess
          else if (index === guessCount && revealedHints.includes(index)) {
            boxClass += ' hint-revealed';
          }
          
          return (
            <div key={index} className={boxClass}>
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DefineBoxes; 