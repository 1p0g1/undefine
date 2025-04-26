/**
 * Shared types for Un-Define game
 */
// Error handling
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
// Game functions
export { HINT_INDICES, INDEX_TO_HINT, clueTypeToNumber, numberToClueType, isHintAvailable, getHintContent } from './utils/game.js';
// Word functions
export { validateWordData, isWordData, validateClues, validateWordId, validateWordLength, validateFirstLetter, joinEquivalents, splitEquivalents, getSynonyms, normalizeEquivalents } from './utils/word.js';
// Mapper functions
export { mapDBWordToGameWord, mapDBUserStatsToUserStats, mapDBGameSessionToGameSession, mapDBLeaderboardEntryToLeaderboardEntry, mapDBStreakLeaderToStreakLeader, mapDBDailyMetricsToDailyMetrics } from './utils/mappers.js';
//# sourceMappingURL=index.js.map