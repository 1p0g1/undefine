import React, { useState, useEffect, useRef } from 'react';
import { WordFormProps, ValidationError } from '../types';
import { validateWordForm, getFieldErrorMessage, hasFieldError } from '../utils/validation';
import { toast } from './Toast';
import './WordForm.css';

/**
 * WordForm component for adding and editing words
 */
const WordForm: React.FC<WordFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [synonymsInput, setSynonymsInput] = useState(
    initialData.synonyms ? initialData.synonyms.join(', ') : ''
  );
  
  // Ref for the first input to focus it on mount
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the first input when the form opens
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);
  
  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle synonyms input change (comma-separated values)
  const handleSynonymsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSynonymsInput(value);
    
    // Convert comma-separated string to array
    const synonymsArray = value
      ? value.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    setFormData(prev => ({
      ...prev,
      synonyms: synonymsArray
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateWordForm(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      
      try {
        // Submit the form data
        await onSubmit(formData);
        
        // Show success message
        toast.success(
          isEditing
            ? `Word "${formData.word}" successfully updated`
            : `Word "${formData.word}" successfully added`
        );
      } catch (error) {
        toast.error(`Failed to ${isEditing ? 'update' : 'add'} word: ${error}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Show error message
      toast.error('Please fix the errors in the form');
      
      // Focus the first field with an error
      const firstErrorField = document.querySelector(
        `[name="${validationErrors[0].field}"]`
      ) as HTMLElement;
      
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  };
  
  // Handle keyboard shortcut to submit form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const formElement = e.currentTarget.closest('form');
      if (formElement) {
        e.preventDefault();
        formElement.requestSubmit();
      }
    }
  };
  
  return (
    <form 
      className="word-form" 
      onSubmit={handleSubmit} 
      onKeyDown={handleKeyDown}
      noValidate
    >
      <div className="form-header">
        <h2>{isEditing ? 'Edit Word' : 'Add New Word'}</h2>
        <p className="form-subtitle">
          {isEditing 
            ? 'Update the details of this word' 
            : 'Fill in the details to add a new word to the database'}
        </p>
      </div>
      
      <div className="form-body">
        <div className="form-group">
          <label htmlFor="word">
            Word <span className="required">*</span>
          </label>
          <input
            ref={firstInputRef}
            type="text"
            id="word"
            name="word"
            value={formData.word}
            onChange={handleChange}
            className={`form-control ${hasFieldError(errors, 'word') ? 'has-error' : ''}`}
            disabled={isSubmitting}
            required
          />
          {hasFieldError(errors, 'word') && (
            <div className="error-message">{getFieldErrorMessage(errors, 'word')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="partOfSpeech">
            Part of Speech <span className="required">*</span>
          </label>
          <select
            id="partOfSpeech"
            name="partOfSpeech"
            value={formData.partOfSpeech}
            onChange={handleChange}
            className={`form-control ${hasFieldError(errors, 'partOfSpeech') ? 'has-error' : ''}`}
            disabled={isSubmitting}
            required
          >
            <option value="">Select part of speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
          </select>
          {hasFieldError(errors, 'partOfSpeech') && (
            <div className="error-message">{getFieldErrorMessage(errors, 'partOfSpeech')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="definition">
            Definition <span className="required">*</span>
          </label>
          <textarea
            id="definition"
            name="definition"
            value={formData.definition}
            onChange={handleChange}
            className={`form-control ${hasFieldError(errors, 'definition') ? 'has-error' : ''}`}
            disabled={isSubmitting}
            rows={3}
            required
          />
          {hasFieldError(errors, 'definition') && (
            <div className="error-message">{getFieldErrorMessage(errors, 'definition')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="alternateDefinition">
            Alternate Definition
          </label>
          <textarea
            id="alternateDefinition"
            name="alternateDefinition"
            value={formData.alternateDefinition}
            onChange={handleChange}
            className="form-control"
            disabled={isSubmitting}
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="synonyms">Synonyms (comma-separated)</label>
          <input
            type="text"
            id="synonyms"
            name="synonyms"
            value={synonymsInput}
            onChange={handleSynonymsChange}
            className={`form-control ${hasFieldError(errors, 'synonyms') ? 'has-error' : ''}`}
            disabled={isSubmitting}
            placeholder="e.g. happy, joyful, content"
          />
          {hasFieldError(errors, 'synonyms') && (
            <div className="error-message">{getFieldErrorMessage(errors, 'synonyms')}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="dateAdded">
            Daily Word Date (DD/MM/YY)
          </label>
          <input
            type="text"
            id="dateAdded"
            name="dateAdded"
            value={formData.dateAdded}
            onChange={handleChange}
            className={`form-control ${hasFieldError(errors, 'dateAdded') ? 'has-error' : ''}`}
            disabled={isSubmitting}
            placeholder="DD/MM/YY"
          />
          {hasFieldError(errors, 'dateAdded') && (
            <div className="error-message">{getFieldErrorMessage(errors, 'dateAdded')}</div>
          )}
          <small className="form-text">
            Date when this word will become the daily word. Leave blank for no specific date.
          </small>
        </div>
      </div>
      
      <div className="form-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Adding...') 
            : (isEditing ? 'Update Word' : 'Add Word')}
        </button>
      </div>
      
      <div className="keyboard-shortcuts-hint">
        <span>Tip: Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save</span>
      </div>
    </form>
  );
};

export default WordForm; 