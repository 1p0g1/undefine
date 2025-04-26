/**
 * Game state types for Un-Define game
 */
/**
 * Mapping from hint type to index
 */
export const HINT_INDICES = {
    D: 0,
    E: 1,
    F: 2,
    I: 3,
    N: 4,
    E2: 5
};
/**
 * Mapping from index to hint type
 */
export const INDEX_TO_HINT = {
    0: 'D',
    1: 'E',
    2: 'F',
    3: 'I',
    4: 'N',
    5: 'E2'
};
/**
 * Helper function to convert a clue type to an index
 */
export const clueTypeToNumber = (type) => HINT_INDICES[type];
/**
 * Helper function to convert an index to a clue type
 */
export const numberToClueType = (index) => INDEX_TO_HINT[index];
/**
 * Helper function to check if a hint is available for a given word
 */
export const isHintAvailable = (wordData, hintIndex) => {
    if (!wordData)
        return false;
    const clueType = numberToClueType(hintIndex);
    return Boolean(wordData[clueType]);
};
/**
 * Helper function to get the hint content for a given word and hint index
 */
export const getHintContent = (wordData, hintIndex) => {
    if (!wordData)
        return null;
    const clueType = numberToClueType(hintIndex);
    return wordData[clueType] ?? null;
};
//# sourceMappingURL=game.js.map