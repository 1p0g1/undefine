/**
 * Game state types for Un-Define game
 */
import { WordClues, GuessResult } from '../types/core.js';
/**
 * Hint index type representing the position of a hint in the hint array
 * 0: Definition (D)
 * 1: Etymology (E)
 * 2: First letter (F)
 * 3: In a sentence (I)
 * 4: Number of letters (N)
 * 5: Equivalents (E2)
 */
export type HintIndex = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * Message type for displaying information to the user
 */
export type Message = {
    type: 'info' | 'success' | 'error' | 'warning';
    text: string;
};
/**
 * History of a guess with its result
 */
export type GuessHistory = {
    guess: string;
    timestamp: number;
    result: GuessResult;
};
/**
 * Canonical game state for the Un-Define game
 */
export type AppGameState = {
    loading: boolean;
    wordData: WordClues | null;
    revealedHints: HintIndex[];
    remainingGuesses: number;
    isGameOver: boolean;
    hasWon: boolean;
    isCorrect: boolean;
    showConfetti: boolean;
    showLeaderboard: boolean;
    message: Message | null;
    guessCount: number;
    guessHistory: GuessHistory[];
    guessResults: GuessResult[];
};
/**
 * Mapping from hint type to index
 */
export declare const HINT_INDICES: {
    readonly D: 0;
    readonly E: 1;
    readonly F: 2;
    readonly I: 3;
    readonly N: 4;
    readonly E2: 5;
};
export type ClueTypeToIndex = typeof HINT_INDICES;
export type IndexToClueType = {
    [K in keyof ClueTypeToIndex as ClueTypeToIndex[K]]: K;
};
/**
 * Mapping from index to hint type
 */
export declare const INDEX_TO_HINT: IndexToClueType;
/**
 * Helper function to convert a clue type to an index
 */
export declare const clueTypeToNumber: (type: keyof typeof HINT_INDICES) => HintIndex;
/**
 * Helper function to convert an index to a clue type
 */
export declare const numberToClueType: (index: HintIndex) => keyof typeof HINT_INDICES;
/**
 * Helper function to check if a hint is available for a given word
 */
export declare const isHintAvailable: (wordData: WordClues | null, hintIndex: HintIndex) => boolean;
/**
 * Helper function to get the hint content for a given word and hint index
 */
export declare const getHintContent: (wordData: WordClues | null, hintIndex: HintIndex) => string | number | string[] | null;
//# sourceMappingURL=game.d.ts.map