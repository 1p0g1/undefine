import { useEffect } from 'react';
import { DEBUG_CONFIG } from '../config/debug.js';
import { HINT_INDICES } from '../types/index.js';

const hintOrder = [0, 1, 2, 3, 4, 5] as const;
type HintIndex = typeof hintOrder[number];

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
      HINT_INDICES.D === 0 && 
      HINT_INDICES.E === 1 && 
      HINT_INDICES.F === 2 && 
      HINT_INDICES.I === 3 && 
      HINT_INDICES.N === 4 && 
      HINT_INDICES.E2 === 5, 
      '❌ Hint order mismatch!'
    );
  }
} 