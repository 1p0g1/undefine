import React from 'react';
import { WordData } from '../types';

interface DefineHintsProps {
  word: WordData;
  revealedHints: string[];
  guessCount: number;
}

const DefineHints: React.FC<DefineHintsProps> = ({ word, revealedHints, guessCount }) => {
  const renderHint = (type: string) => {
    const isRevealed = revealedHints.includes(type);
    const hintClass = `hint ${isRevealed ? 'revealed' : 'hidden'}`;

    let content = '';
    switch (type) {
      case 'D':
        content = word.definition;
        break;
      case 'E':
        content = word.etymology || 'No etymology available';
        break;
      case 'F':
        content = word.first_letter || 'No first letter hint';
        break;
      case 'I':
        content = word.in_a_sentence || 'No example sentence available';
        break;
      case 'N':
        content = word.number_of_letters ? `${word.number_of_letters} letters` : 'No letter count available';
        break;
      case 'E2':
        content = word.equivalents || 'No synonyms available';
        break;
      default:
        content = 'Unknown hint type';
    }

    return (
      <div key={type} className={hintClass}>
        <span className="hint-type">{type}</span>
        <span className="hint-content">{isRevealed ? content : '???'}</span>
      </div>
    );
  };

  return (
    <div className="define-hints">
      {['D', 'E', 'F', 'I', 'N', 'E2'].map(type => renderHint(type))}
      <div className="guesses-remaining">
        Guesses remaining: {6 - guessCount}
      </div>
    </div>
  );
};

export default DefineHints; 