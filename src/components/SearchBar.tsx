import React, { useState, useRef, useEffect } from 'react';
import { SearchBarProps } from '../types';
import { debounce } from '../utils/helpers';
import './SearchBar.css';

/**
 * Reusable search bar component with debounced input
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  debounceTime = 300,
  autoFocus = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Create debounced change handler
  const debouncedOnChange = debounce((searchTerm: string) => {
    onChange(searchTerm);
  }, debounceTime);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };
  
  // Handle clearing the search
  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (onClear) onClear();
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle keyboard shortcut focus (e.g., when '/' is pressed)
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Auto focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Expose focus method to parent components
  React.useImperativeHandle(
    React.forwardRef((props, ref) => ref),
    () => ({
      focus: focusInput
    })
  );
  
  return (
    <div className="search-bar">
      <div className="search-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        aria-label={placeholder}
      />
      
      {localValue && (
        <button
          type="button"
          className="clear-button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      
      <div className="keyboard-shortcut" title="Press '/' to focus">
        /
      </div>
    </div>
  );
};

export default SearchBar; 