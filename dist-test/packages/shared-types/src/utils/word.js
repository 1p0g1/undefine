import { z } from 'zod';
import { validate as uuidValidate } from 'uuid';
/**
 * Represents the core clue data that is guaranteed to be present and valid.
 * This interface is used for runtime validation and type safety.
 */
// Removing local SafeClueData interface since it's imported from core.ts
/**
 * Runtime type guard to validate clue data structure.
 * Ensures all required fields are present and have correct types.
 */
export function isValidClueData(clues) {
    if (!clues || typeof clues !== 'object')
        return false;
    const requiredFields = ['D', 'E', 'F', 'I', 'N', 'E2'];
    return requiredFields.every(field => field in clues);
}
// Zod schema for clue validation with enhanced rules
const ClueValueSchema = z.object({
    D: z.string().min(1, 'Definition must not be empty').trim(),
    E: z.string().nullable(),
    F: z.string().length(1, 'First letter must be exactly one character').regex(/^[a-zA-Z]$/, 'First letter must be alphabetic'),
    I: z.string().nullable(),
    N: z.number().int().positive('Number of letters must be positive'),
    E2: z.string().nullable(),
});
// Zod schema for word validation with enhanced rules
export const WordSchema = z.object({
    id: z.string().uuid('Invalid UUID format'),
    word: z.string().min(1, 'Word must not be empty').trim(),
    definition: z.string().min(1, 'Definition must not be empty').trim(),
    etymology: z.string().nullable(),
    first_letter: z.string().length(1, 'First letter must be exactly one character').regex(/^[a-zA-Z]$/, 'First letter must be alphabetic'),
    in_a_sentence: z.string().nullable(),
    number_of_letters: z.number().int().positive('Number of letters must be positive'),
    equivalents: z.string().nullable(),
    difficulty: z.string().nullable(),
    created_at: z.string().datetime().nullable(),
    updated_at: z.string().datetime().nullable(),
    clues: ClueValueSchema,
});
/**
 * Represents a complete word entry with all its metadata and clues.
 * This type is used throughout the application for type safety.
 */
// Removing local WordData type since it's imported from core.ts
/**
 * Utility function to join an array of equivalents into a comma-separated string
 * Handles null/undefined inputs safely
 */
export const joinEquivalents = (eq) => Array.isArray(eq) ? eq.join(', ') : eq ?? null;
/**
 * Utility function to split a comma-separated string of equivalents into an array
 * Handles null/undefined inputs safely
 */
export const splitEquivalents = (eq) => {
    if (!eq)
        return [];
    return eq.split(',').map(s => s.trim()).filter(Boolean);
};
/**
 * Splits a comma-separated string of synonyms into an array.
 * Returns an empty array if input is null or empty.
 * @deprecated Use splitEquivalents instead for consistency
 */
export const getSynonyms = (equivalents) => {
    return splitEquivalents(equivalents);
};
/**
 * Validates and returns a WordData object.
 * Throws if the data is invalid or missing required fields.
 */
export const validateWordData = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid word data: must be an object');
    }
    const wordData = data;
    if (!wordData.word || typeof wordData.word !== 'string') {
        throw new Error('Invalid word data: word must be a string');
    }
    if (!wordData.clues || typeof wordData.clues !== 'object') {
        throw new Error('Invalid word data: clues must be an object');
    }
    if (!isValidClueData(wordData.clues)) {
        throw new Error('Invalid word data: clues must contain all required fields');
    }
    return wordData;
};
/**
 * Type guard to check if an unknown value is a valid WordData object.
 */
export const isWordData = (data) => {
    try {
        validateWordData(data);
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Validates a UUID string.
 */
export function validateWordId(id) {
    return uuidValidate(id);
}
/**
 * Validates clue data structure and returns a type guard.
 */
export function validateClues(clues) {
    if (!clues || typeof clues !== 'object')
        return false;
    const requiredFields = ['D', 'E', 'F', 'I', 'N', 'E2'];
    return requiredFields.every(field => field in clues);
}
/**
 * Validates that the word length matches the number_of_letters field.
 */
export function validateWordLength(word, numberOfLetters) {
    return word.length === numberOfLetters;
}
/**
 * Validates that the first letter matches the first_letter field.
 */
export function validateFirstLetter(word, firstLetter) {
    return word.charAt(0).toLowerCase() === firstLetter.toLowerCase();
}
/**
 * Comprehensive validation of a WordData object including cross-field validations.
 */
export function validateWordDataComprehensive(data) {
    if (!data || typeof data !== 'object')
        return false;
    // Check required fields
    const requiredFields = ['word', 'clues'];
    if (!requiredFields.every(field => field in data))
        return false;
    // Validate word
    if (typeof data.word !== 'string' || data.word.length === 0)
        return false;
    // Validate clues
    if (!validateClues(data.clues))
        return false;
    return true;
}
/**
 * Safely normalizes equivalents to a string array
 * Handles all possible DB shapes (undefined, null, string, string[])
 * @param equivalents The equivalents value from the database
 * @returns A normalized string array
 */
export function normalizeEquivalents(equivalents) {
    if (Array.isArray(equivalents)) {
        return equivalents;
    }
    if (typeof equivalents === 'string') {
        // Handle comma-separated string case
        return equivalents.split(',').filter(Boolean);
    }
    // Handle null, undefined, or any other type
    return [];
}
//# sourceMappingURL=word.js.map