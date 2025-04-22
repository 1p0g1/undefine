import React from 'react';
import { HINT_INDICES, HintIndex, GuessResult } from '../types/game.js';
import './DefineBoxes.css';

interface DefineBoxesProps {
  revealedHints: HintIndex[];
  onHintReveal: (hint: HintIndex) => void;
  isGameOver: boolean;
  hasWon: boolean;
  guessResults: GuessResult[];
}

const DefineBoxes: React.FC<DefineBoxesProps> = ({
  revealedHints,
  onHintReveal,
  isGameOver,
  hasWon,
  guessResults,
}) => {
  const defineLetters = Object.values(HINT_INDICES);
  
  return (
    <div className="define-boxes-container">
      <span className="un-prefix">Un ·</span>
      <div className="define-boxes">
        {defineLetters.map((letter, index) => {
          let boxClass = 'define-box';
          
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
              onClick={() => !isGameOver && onHintReveal(letter)}
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