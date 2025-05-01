import React from 'react';
import type { WordClues } from '@undefine/shared-types';
import { type HintIndex } from '@undefine/shared-types';
import './DefineHints.css';

interface DefineHintsProps {
  wordData: WordClues | null;
  revealedHints: HintIndex[];
  guessCount: number;
  onSynonymClick?: (synonym: string) => void;
  isLoading?: boolean;
}

const DefineHints: React.FC<DefineHintsProps> = ({ 
  wordData, 
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

  const renderHint = (index: number) => {
    switch (index) {
      case 0: // Definition
        return (
          <div className="hint-box">
            <div className="hint-label">Definition</div>
            <blockquote className="hint-content">
              {wordData?.D || 'No definition available'}
            </blockquote>
          </div>
        );
      
      case 1: // Equivalents (E2)
        return (
          <div className="hint-box">
            <div className="hint-label">Synonyms</div>
            <div className="hint-content synonyms-list">
              {Array.isArray(wordData?.E2) && wordData.E2.length > 0 ? (
                wordData.E2.map((synonym: string, i: number) => (
                  <span key={i} className="synonym-tag">{synonym}</span>
                ))
              ) : (
                <span className="no-synonyms">No synonyms available</span>
              )}
            </div>
          </div>
        );
      
      case 2: // First Letter
        return (
          <div className="hint-box">
            <div className="hint-label">First Letter</div>
            <blockquote className="hint-content">
              {wordData?.F || 'No first letter available'}
            </blockquote>
          </div>
        );
      
      case 3: // In a Sentence
        return (
          <div className="hint-box">
            <div className="hint-label">Example</div>
            <blockquote className="hint-content">
              {wordData?.I || 'No example available'}
            </blockquote>
          </div>
        );
      
      case 4: // Number of Letters
        return (
          <div className="hint-box">
            <div className="hint-label">Letter Count</div>
            <blockquote className="hint-content">
              {wordData?.N || 'No letter count available'}
            </blockquote>
          </div>
        );
      
      case 5: // Etymology
        return (
          <div className="hint-box">
            <div className="hint-label">Etymology</div>
            <blockquote className="hint-content etymology-text">
              {wordData?.E || 'No etymology available'}
            </blockquote>
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