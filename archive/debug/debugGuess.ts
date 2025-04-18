import { FuzzyMatchResult } from '../src/types/shared.js';

function getFuzzyMatch(guess: string, word: string): FuzzyMatchResult {
  if (guess.length !== word.length) {
    return { isFuzzy: false, fuzzyPositions: [] };
  }

  const fuzzyPositions = guess
    .split('')
    .reduce((acc, char, i) => {
      if (char !== word[i]) acc.push(i);
      return acc;
    }, [] as number[]);

  const matchPercentage = 1 - fuzzyPositions.length / guess.length;
  return {
    isFuzzy: matchPercentage >= 0.7,
    fuzzyPositions,
  };
}

export function debugGuess(guess: string, correct: string) {
  const g = guess.trim().toLowerCase();
  const w = correct.trim().toLowerCase();

  console.log('Debug Word Comparison');
  console.log('--------------------');
  console.log('Input:', { guess, correct });
  console.log('Normalized:', { g, w });
  console.log('Exact Match:', g === w);
  
  const { isFuzzy, fuzzyPositions } = getFuzzyMatch(g, w);
  console.log('Fuzzy Match:', { 
    isFuzzy, 
    fuzzyPositions,
    matchPercentage: 1 - (fuzzyPositions.length / g.length)
  });

  // Character-by-character comparison
  console.log('\nCharacter Analysis:');
  Array.from(g).forEach((char, i) => {
    console.log(`Position ${i}: ${char} vs ${w[i]} | Match: ${char === w[i]}`);
  });
}

// Example usage:
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log('Usage: ts-node debugGuess.ts <guess> <correct>');
    process.exit(1);
  }
  debugGuess(args[0], args[1]);
} 