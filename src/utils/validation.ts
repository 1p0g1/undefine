import { ValidationError } from '@undefine/shared-types';

// Define a custom form type for word validation without extending FormState
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
  [key: string]: any; // Allow other fields
}

/**
 * Validates a word form data
 * @param formData The form data to validate
 * @returns Array of validation errors (empty if no errors)
 */
export const validateWordForm = (formData: WordFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate word
  if (!formData.word || formData.word.trim() === '') {
    errors.push({
      field: 'word',
      message: 'Word is required'
    });
  } else if (formData.word.length > 50) {
    errors.push({
      field: 'word',
      message: 'Word must be 50 characters or less'
    });
  }

  // Validate part of speech
  if (!formData.partOfSpeech || formData.partOfSpeech.trim() === '') {
    errors.push({
      field: 'partOfSpeech',
      message: 'Part of speech is required'
    });
  }

  // Validate definition
  if (!formData.definition || formData.definition.trim() === '') {
    errors.push({
      field: 'definition',
      message: 'Definition is required'
    });
  } else if (formData.definition.length > 500) {
    errors.push({
      field: 'definition',
      message: 'Definition must be 500 characters or less'
    });
  }

  // Validate alternate definition (if provided)
  if (formData.alternateDefinition && formData.alternateDefinition.length > 500) {
    errors.push({
      field: 'alternateDefinition',
      message: 'Alternate definition must be 500 characters or less'
    });
  }

  // Validate dateAdded (if provided)
  if (formData.dateAdded && formData.dateAdded.trim() !== '') {
    const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
    
    if (!dateRegex.test(formData.dateAdded)) {
      errors.push({
        field: 'dateAdded',
        message: 'Date must be in the format DD/MM/YY'
      });
    } else {
      // Further validation to ensure it's a valid date
      const [day, month, year] = formData.dateAdded.split('/').map(Number);
      const isValidDate = !isNaN(day) && !isNaN(month) && !isNaN(year) &&
                          day > 0 && day <= 31 &&
                          month > 0 && month <= 12 &&
                          year >= 0 && year <= 99;
      
      if (!isValidDate) {
        errors.push({
          field: 'dateAdded',
          message: 'Please enter a valid date'
        });
      }
    }
  }

  return errors;
};

/**
 * Checks if there's an error for a specific field
 * @param errors Array of validation errors
 * @param fieldName Name of the field to check
 * @returns True if the field has an error, false otherwise
 */
export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some(error => error.field === fieldName);
};

/**
 * Gets the error message for a specific field
 * @param errors Array of validation errors
 * @param fieldName Name of the field to get the error message for
 * @returns The error message or an empty string if no error
 */
export const getFieldErrorMessage = (errors: ValidationError[], fieldName: string): string => {
  const error = errors.find(error => error.field === fieldName);
  return error ? error.message : '';
}; 