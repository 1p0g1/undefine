import React from 'react';
import './DefineHints.css';
import { WordData } from '../types';

interface DefineHintsProps {
  word: WordData;
  revealedHints: number[];
  guessCount: number;
  onSynonymClick?: (synonym: string) => void;
  isLoading?: boolean;
}

const DefineHints: React.FC<DefineHintsProps> = ({ 
  word, 
  revealedHints, 
  guessCount,
  onSynonymClick,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="define-hints loading">
        <div className="loading-spinner" />
        <div className="loading-text">Loading hints...</div>
      </div>
    );
  }

  const renderHint = (type: number) => {
    const isRevealed = revealedHints.includes(type);
    const hintClass = `hint-item ${isRevealed ? 'revealed' : 'hidden'}`;

    switch (type) {
      case 0: // Definition
        return (
          <div className={hintClass}>
            <div className="hint-label">Definition</div>
            <p className="hint-content definition-text">{word.definition}</p>
          </div>
        );
      
      case 1: // Etymology
        return isRevealed ? (
          <div className={hintClass}>
            <div className="hint-label">Etymology</div>
            <blockquote className="hint-content etymology-text">
              {word.etymology || 'No etymology available'}
            </blockquote>
          </div>
        ) : null;
      
      case 2: // First Letter
        return isRevealed ? (
          <div className={hintClass}>
            <div className="hint-label">First Letter</div>
            <div className="hint-content first-letter">
              {word.first_letter}_______
            </div>
          </div>
        ) : null;
      
      case 3: // In a Sentence
        return isRevealed ? (
          <div className={hintClass}>
            <div className="hint-label">In a Sentence</div>
            <p className="hint-content sentence-text">
              {word.in_a_sentence?.replace(word.word, '_____') || 'No example sentence available'}
            </p>
          </div>
        ) : null;
      
      case 4: // Number of Letters
        return isRevealed ? (
          <div className={hintClass}>
            <div className="hint-label">Number of Letters</div>
            <div className="hint-content letter-boxes">
              {Array(word.number_of_letters || 0).fill('_').map((_, i) => (
                <span key={i} className="letter-box" />
              ))}
            </div>
          </div>
        ) : null;
      
      case 5: // Equivalents (E2)
        return isRevealed ? (
          <div className={hintClass}>
            <div className="hint-label">Synonyms</div>
            <div className="hint-content synonym-chips">
              {(word.equivalents || '').split(',').map((synonym, i) => (
                <button
                  key={i}
                  className="synonym-chip"
                  onClick={() => onSynonymClick?.(synonym.trim())}
                >
                  {synonym.trim()}
                </button>
              ))}
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="define-hints">
      {[0, 1, 2, 3, 4, 5].map(type => renderHint(type))}
      <div className="guesses-remaining">
        Guesses remaining: {6 - guessCount}
      </div>
    </div>
  );
};

export default DefineHints; 