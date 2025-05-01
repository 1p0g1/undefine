import { useEffect } from 'react';
import { DEBUG_CONFIG } from '../config/debug.js';
import { type HintIndex } from '@undefine/shared-types';

const hintOrder = [0, 1, 2, 3, 4, 5] as const;

interface UseHintRevealerProps {
  guessCount: number;
  isGameOver: boolean;
  revealedHints: number[];
  setRevealedHints: (hints: number[]) => void;
}

export function useHintRevealer({
  guessCount,
  isGameOver,
  revealedHints,
  setRevealedHints
}: UseHintRevealerProps) {
  useEffect(() => {
    if (isGameOver) return;

    const hintIndex = guessCount < hintOrder.length ? hintOrder[guessCount] : null;
    
    if (DEBUG_CONFIG.verboseLogging) {
      console.log('[DEBUG] Hint revealing logic:', {
        guessCount,
        hintTypeToReveal: hintIndex !== null ? 
          (hintIndex === 1 ? 'Etymology' : 
           hintIndex === 2 ? 'First Letter' : 
           hintIndex === 3 ? 'Example' : 
           hintIndex === 4 ? 'Number of Letters' : 
           hintIndex === 5 ? 'Equivalents' : 'Unknown') : 'None',
        currentRevealedHints: revealedHints,
        willRevealNewHint: hintIndex !== null && !revealedHints.includes(hintIndex)
      });
    }

    if (hintIndex !== null && !revealedHints.includes(hintIndex)) {
      const newRevealedHints = [...revealedHints, hintIndex];
      setRevealedHints(newRevealedHints);
      
      if (DEBUG_CONFIG.verboseLogging) {
        console.log('[DEBUG] Updated revealed hints:', {
          newRevealedHints,
          hintTypes: newRevealedHints.map(index => 
            index === 1 ? 'Etymology' : 
            index === 2 ? 'First Letter' : 
            index === 3 ? 'Example' : 
            index === 4 ? 'Number of Letters' : 
            index === 5 ? 'Equivalents' : 'Unknown'
          )
        });
      }
    }
  }, [guessCount, isGameOver, revealedHints, setRevealedHints]);

  // Runtime assertion for hint order integrity
  if (DEBUG_CONFIG.verboseLogging) {
    console.assert(
      hintOrder[0] === 0 && 
      hintOrder[1] === 1 && 
      hintOrder[2] === 2 && 
      hintOrder[3] === 3 && 
      hintOrder[4] === 4 && 
      hintOrder[5] === 5, 
      '❌ Hint order mismatch!'
    );
  }
} 