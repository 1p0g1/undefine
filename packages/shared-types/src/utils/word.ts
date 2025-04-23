import { z } from 'zod';
import { validate as uuidValidate } from 'uuid';

/**
 * Represents the core clue data that is guaranteed to be present and valid.
 * This interface is used for runtime validation and type safety.
 */
export interface SafeClueData {
  /** The primary definition of the word - always required and non-empty */
  D: string;
  
  /** Etymology (word origin) - optional, can be null */
  E: string | null;
  
  /** First letter of the word - always required, exactly one character */
  F: string;
  
  /** Example sentence using the word - optional, can be null */
  I: string | null;
  
  /** Number of letters in the word - always required, positive integer */
  N: number;
  
  /** Synonyms as comma-separated string - optional, can be null */
  E2: string | null;
}

/**
 * Runtime type guard to validate clue data structure.
 * Ensures all required fields are present and have correct types.
 */
export function isValidClueData(clues: unknown): clues is SafeClueData {
  if (!clues || typeof clues !== 'object') return false;
  const c = clues as Record<string, unknown>;
  
  // Check for required fields
  if (!('D' in c) || !('F' in c) || !('N' in c)) return false;
  
  // Validate definition
  if (typeof c.D !== 'string' || c.D.trim().length === 0) return false;
  
  // Validate first letter
  if (typeof c.F !== 'string' || c.F.length !== 1 || !/^[a-zA-Z]$/.test(c.F)) return false;
  
  // Validate number of letters
  if (typeof c.N !== 'number' || !Number.isInteger(c.N) || c.N <= 0) return false;
  
  // Validate optional fields
  if (c.E !== null && typeof c.E !== 'string') return false;
  if (c.I !== null && typeof c.I !== 'string') return false;
  if (c.E2 !== null && typeof c.E2 !== 'string') return false;
  
  return true;
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
export type WordData = {
  /** Unique identifier for the word */
  id: string;
  
  /** The actual word */
  word: string;
  
  /** Primary definition of the word */
  definition: string;
  
  /** Word origin/etymology - optional */
  etymology: string | null;
  
  /** First letter of the word (always single character) */
  first_letter: string;
  
  /** Example sentence using the word - optional */
  in_a_sentence: string | null;
  
  /** Length of the word (positive integer) */
  number_of_letters: number;
  
  /** Comma-separated list of synonyms - optional */
  equivalents: string | null;
  
  /** Difficulty rating - optional */
  difficulty: string | null;
  
  /** Creation timestamp - optional */
  created_at: string | null;
  
  /** Last update timestamp - optional */
  updated_at: string | null;
  
  /** Validated clue data - always present */
  clues: SafeClueData;
};

/**
 * Utility function to join an array of equivalents into a comma-separated string
 * Handles null/undefined inputs safely
 */
export const joinEquivalents = (eq: string[] | null | undefined): string | null => 
  Array.isArray(eq) ? eq.join(', ') : eq ?? null;

/**
 * Utility function to split a comma-separated string of equivalents into an array
 * Handles null/undefined inputs safely
 */
export const splitEquivalents = (eq: string | null | undefined): string[] => {
  if (!eq) return [];
  return eq.split(',').map(s => s.trim()).filter(Boolean);
};

/**
 * Splits a comma-separated string of synonyms into an array.
 * Returns an empty array if input is null or empty.
 * @deprecated Use splitEquivalents instead for consistency
 */
export const getSynonyms = (equivalents: string | null): string[] => {
  return splitEquivalents(equivalents);
};

/**
 * Validates and returns a WordData object.
 * Throws if the data is invalid or missing required fields.
 */
export const validateWordData = (data: unknown): WordData => {
  try {
    const parsed = WordSchema.parse(data);
    if (!isValidClueData(parsed.clues)) {
      throw new Error('Invalid clue data structure');
    }
    return parsed as WordData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map((e: z.ZodIssue) => e.message).join(', ')}`);
    }
    throw error;
  }
};

/**
 * Type guard to check if an unknown value is a valid WordData object.
 */
export const isWordData = (data: unknown): data is WordData => {
  try {
    const parsed = WordSchema.parse(data);
    return isValidClueData(parsed.clues);
  } catch {
    return false;
  }
};

/**
 * Validates a UUID string.
 */
export function validateWordId(id: string): boolean {
  return uuidValidate(id);
}

/**
 * Validates clue data structure and returns a type guard.
 */
export function validateClues(clues: unknown): clues is SafeClueData {
  try {
    ClueValueSchema.parse(clues);
    return isValidClueData(clues);
  } catch {
    return false;
  }
}

/**
 * Validates that the word length matches the number_of_letters field.
 */
export function validateWordLength(word: string, numberOfLetters: number): boolean {
  return word.length === numberOfLetters;
}

/**
 * Validates that the first letter matches the first_letter field.
 */
export function validateFirstLetter(word: string, firstLetter: string): boolean {
  return word.charAt(0).toLowerCase() === firstLetter.toLowerCase();
}

/**
 * Comprehensive validation of a WordData object including cross-field validations.
 */
export function validateWordDataComprehensive(data: WordData): boolean {
  return (
    validateWordLength(data.word, data.number_of_letters) &&
    validateFirstLetter(data.word, data.first_letter) &&
    validateWordId(data.id) &&
    isValidClueData(data.clues)
  );
}

/**
 * Safely normalizes equivalents to a string array
 * Handles all possible DB shapes (undefined, null, string, string[])
 * @param equivalents The equivalents value from the database
 * @returns A normalized string array
 */
export function normalizeEquivalents(equivalents: unknown): string[] {
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