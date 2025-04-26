import { z } from 'zod';
import { WordData, SafeClueData } from '../types/core.js';
/**
 * Represents the core clue data that is guaranteed to be present and valid.
 * This interface is used for runtime validation and type safety.
 */
/**
 * Runtime type guard to validate clue data structure.
 * Ensures all required fields are present and have correct types.
 */
export declare function isValidClueData(clues: unknown): clues is SafeClueData;
export declare const WordSchema: z.ZodObject<{
    id: z.ZodString;
    word: z.ZodString;
    definition: z.ZodString;
    etymology: z.ZodNullable<z.ZodString>;
    first_letter: z.ZodString;
    in_a_sentence: z.ZodNullable<z.ZodString>;
    number_of_letters: z.ZodNumber;
    equivalents: z.ZodNullable<z.ZodString>;
    difficulty: z.ZodNullable<z.ZodString>;
    created_at: z.ZodNullable<z.ZodString>;
    updated_at: z.ZodNullable<z.ZodString>;
    clues: z.ZodObject<{
        D: z.ZodString;
        E: z.ZodNullable<z.ZodString>;
        F: z.ZodString;
        I: z.ZodNullable<z.ZodString>;
        N: z.ZodNumber;
        E2: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        D: string;
        E: string | null;
        F: string;
        I: string | null;
        N: number;
        E2: string | null;
    }, {
        D: string;
        E: string | null;
        F: string;
        I: string | null;
        N: number;
        E2: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    word: string;
    definition: string;
    etymology: string | null;
    first_letter: string;
    in_a_sentence: string | null;
    number_of_letters: number;
    equivalents: string | null;
    difficulty: string | null;
    created_at: string | null;
    updated_at: string | null;
    clues: {
        D: string;
        E: string | null;
        F: string;
        I: string | null;
        N: number;
        E2: string | null;
    };
}, {
    id: string;
    word: string;
    definition: string;
    etymology: string | null;
    first_letter: string;
    in_a_sentence: string | null;
    number_of_letters: number;
    equivalents: string | null;
    difficulty: string | null;
    created_at: string | null;
    updated_at: string | null;
    clues: {
        D: string;
        E: string | null;
        F: string;
        I: string | null;
        N: number;
        E2: string | null;
    };
}>;
/**
 * Represents a complete word entry with all its metadata and clues.
 * This type is used throughout the application for type safety.
 */
/**
 * Utility function to join an array of equivalents into a comma-separated string
 * Handles null/undefined inputs safely
 */
export declare const joinEquivalents: (eq: string[] | null | undefined) => string | null;
/**
 * Utility function to split a comma-separated string of equivalents into an array
 * Handles null/undefined inputs safely
 */
export declare const splitEquivalents: (eq: string | null | undefined) => string[];
/**
 * Splits a comma-separated string of synonyms into an array.
 * Returns an empty array if input is null or empty.
 * @deprecated Use splitEquivalents instead for consistency
 */
export declare const getSynonyms: (equivalents: string | null) => string[];
/**
 * Validates and returns a WordData object.
 * Throws if the data is invalid or missing required fields.
 */
export declare const validateWordData: (data: unknown) => WordData;
/**
 * Type guard to check if an unknown value is a valid WordData object.
 */
export declare const isWordData: (data: unknown) => data is WordData;
/**
 * Validates a UUID string.
 */
export declare function validateWordId(id: string): boolean;
/**
 * Validates clue data structure and returns a type guard.
 */
export declare function validateClues(clues: unknown): clues is SafeClueData;
/**
 * Validates that the word length matches the number_of_letters field.
 */
export declare function validateWordLength(word: string, numberOfLetters: number): boolean;
/**
 * Validates that the first letter matches the first_letter field.
 */
export declare function validateFirstLetter(word: string, firstLetter: string): boolean;
/**
 * Comprehensive validation of a WordData object including cross-field validations.
 */
export declare function validateWordDataComprehensive(data: WordData): boolean;
/**
 * Safely normalizes equivalents to a string array
 * Handles all possible DB shapes (undefined, null, string, string[])
 * @param equivalents The equivalents value from the database
 * @returns A normalized string array
 */
export declare function normalizeEquivalents(equivalents: unknown): string[];
//# sourceMappingURL=word.d.ts.map