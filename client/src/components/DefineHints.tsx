import React from 'react';
import './DefineHints.css';

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
    // Definition (type 0) is always revealed
    const isRevealed = type === 0 || revealedHints.includes(type);
    const hintClass = `hint-item ${isRevealed ? 'revealed' : 'hidden'}`;

    switch (type) {
      case 0: // Definition
        return (
          <div className={hintClass}>
            <div className="hint-label">Definition</div>
            <p className="hint-content definition-text">
              {word.clues?.D || 'No definition available'}
            </p>
          </div>
        );
      
      case 1: // Etymology
        return (
          <div className={hintClass}>
            <div className="hint-label">Etymology</div>
            <blockquote className="hint-content etymology-text">
              {word.clues?.E || 'No etymology available'}
            </blockquote>
          </div>
        );
      
      case 2: // First Letter
        return (
          <div className={hintClass}>
            <div className="hint-label">First Letter</div>
            <div className="hint-content first-letter">
              {word.clues?.F || '—'}_______
            </div>
          </div>
        );
      
      case 3: // In a Sentence
        return (
          <div className={hintClass}>
            <div className="hint-label">In a Sentence</div>
            <p className="hint-content sentence-text">
              {word.clues?.I || 'No example sentence available'}
            </p>
          </div>
        );
      
      case 4: // Number of Letters
        return (
          <div className={hintClass}>
            <div className="hint-label">Number of Letters</div>
            <div className="hint-content letter-boxes">
              {Array(Number(word.clues?.N || 0)).fill('_').map((_, i) => (
                <span key={`letter-box-${i}`} className="letter-box" />
              ))}
            </div>
          </div>
        );
      
      case 5: // Equivalents (E2)
        return (
          <div className={hintClass}>
            <div className="hint-label">Synonyms</div>
            <div className="hint-content synonym-chips">
              {(word.clues?.E2 ?? []).length > 0 ? (
                (word.clues?.E2 ?? []).map((synonym: string, i: number) => (
                  <button
                    key={`synonym-${synonym}-${i}`}
                    className="synonym-chip"
                    onClick={() => onSynonymClick?.(synonym)}
                  >
                    {synonym || '—'}
                  </button>
                ))
              ) : (
                <span className="no-synonyms">No synonyms available</span>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="define-hints">
      {[0, 1, 2, 3, 4, 5].map(type => (
        <React.Fragment key={`hint-type-${type}`}>
          {renderHint(type)}
        </React.Fragment>
      ))}
      <div className="guesses-remaining">
        Guesses remaining: {6 - guessCount}
      </div>
    </div>
  );
};

export default DefineHints; 