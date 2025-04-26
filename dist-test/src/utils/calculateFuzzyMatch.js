export function calculateFuzzyMatch(guess, target) {
    const guessWords = guess.toLowerCase().split(' ');
    const targetWords = target.toLowerCase().split(' ');
    // Check if any word in the guess appears in the target
    return guessWords.some(guessWord => targetWords.some(targetWord => targetWord.includes(guessWord) || guessWord.includes(targetWord)));
}
//# sourceMappingURL=calculateFuzzyMatch.js.map