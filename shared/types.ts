/**
 * Represents a word entry in the application
 */
export interface WordEntry {
  /** The word itself */
  word: string;
  /** The part of speech (noun, verb, etc.) */
  partOfSpeech: string;
  /** A list of synonyms for the word */
  synonyms?: string[];
  /** The primary definition of the word */
  definition: string;
  /** An optional alternate definition */
  alternateDefinition?: string;
  /** Date when this word will be the daily word (DD/MM/YY) */
  dateAdded: string;
  /** Letter count information */
  letterCount: {
    count: number;
    display: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the form state for adding/editing a word
 */
export interface FormState {
  word: string;
  partOfSpeech: string;
  synonyms: string[];
  definition: string;
  alternateDefinition: string;
  dateAdded: string;
  letterCount: {
    count: number;
    display: string;
  };
}

/**
 * Represents a validation error for a form field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Common API response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
} 