import { ValidationError } from '../shared/types/shared.js';
interface WordFormData {
    word?: string;
    partOfSpeech?: string;
    definition?: string;
    alternateDefinition?: string;
    dateAdded?: string;
    letterCount?: {
        count: number;
        display: string;
    };
    [key: string]: any;
}
/**
 * Validates a word form data
 * @param formData The form data to validate
 * @returns Array of validation errors (empty if no errors)
 */
export declare const validateWordForm: (formData: WordFormData) => ValidationError[];
/**
 * Checks if there's an error for a specific field
 * @param errors Array of validation errors
 * @param fieldName Name of the field to check
 * @returns True if the field has an error, false otherwise
 */
export declare const hasFieldError: (errors: ValidationError[], fieldName: string) => boolean;
/**
 * Gets the error message for a specific field
 * @param errors Array of validation errors
 * @param fieldName Name of the field to get the error message for
 * @returns The error message or an empty string if no error
 */
export declare const getFieldErrorMessage: (errors: ValidationError[], fieldName: string) => string;
export {};
