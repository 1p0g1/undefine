import { FormState, ValidationError } from '../types';

/**
 * Validates a word form for required fields and formats
 */
export const validateWordForm = (formData: FormState): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate word field
  if (!formData.word) {
    errors.push({ field: 'word', message: 'Word is required' });
  } else if (formData.word.length > 50) {
    errors.push({ field: 'word', message: 'Word must be 50 characters or less' });
  } else if (!/^[a-zA-Z\s\-']+$/.test(formData.word)) {
    errors.push({ field: 'word', message: 'Word can only contain letters, spaces, hyphens, and apostrophes' });
  }

  // Validate part of speech
  if (!formData.partOfSpeech) {
    errors.push({ field: 'partOfSpeech', message: 'Part of speech is required' });
  }

  // Validate definition
  if (!formData.definition) {
    errors.push({ field: 'definition', message: 'Definition is required' });
  } else if (formData.definition.length > 500) {
    errors.push({ field: 'definition', message: 'Definition must be 500 characters or less' });
  }

  // Validate date format (DD/MM/YY)
  if (formData.dateAdded) {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;
    if (!dateRegex.test(formData.dateAdded)) {
      errors.push({ field: 'dateAdded', message: 'Date must be in DD/MM/YY format' });
    } else {
      // Further validate that the date is valid
      const [day, month, year] = formData.dateAdded.split('/').map(Number);
      const fullYear = 2000 + year; // Assuming 20xx for the year
      const date = new Date(fullYear, month - 1, day);
      
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== fullYear
      ) {
        errors.push({ field: 'dateAdded', message: 'Invalid date value' });
      }
    }
  }

  // Validate synonyms format if provided
  if (formData.synonyms && formData.synonyms.length > 0) {
    for (const synonym of formData.synonyms) {
      if (!/^[a-zA-Z\s\-']+$/.test(synonym)) {
        errors.push({
          field: 'synonyms',
          message: 'Synonyms can only contain letters, spaces, hyphens, and apostrophes'
        });
        break;
      }
    }
  }

  return errors;
};

/**
 * Formats a date string from different formats to DD/MM/YY
 */
export const formatDateToDDMMYY = (date: string | Date): string => {
  if (!date) return '';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // If it's already in DD/MM/YY format, return it
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(date)) {
      return date;
    }
    
    // Otherwise, try to parse it
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return ''; // Invalid date
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear()).slice(-2);
  
  return `${day}/${month}/${year}`;
};

/**
 * Parse DD/MM/YY format to Date object
 */
export const parseDDMMYY = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  
  const [_, day, month, year] = match;
  // Assume 20xx for years in YY format
  const fullYear = 2000 + parseInt(year, 10);
  
  const date = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
  
  // Check if the date is valid
  if (
    date.getDate() !== parseInt(day, 10) ||
    date.getMonth() !== parseInt(month, 10) - 1 ||
    date.getFullYear() !== fullYear
  ) {
    return null;
  }
  
  return date;
};

/**
 * Get a user-friendly error message for a field
 */
export const getFieldErrorMessage = (errors: ValidationError[], fieldName: string): string => {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : '';
};

/**
 * Check if a field has an error
 */
export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some(err => err.field === fieldName);
}; 