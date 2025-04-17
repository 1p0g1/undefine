import { useState, useCallback, useEffect } from 'react';
import { ValidationError } from '../types/index.js';

interface UseFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  validate?: (values: T) => ValidationError[];
  validateOnChange?: boolean;
  resetOnSubmit?: boolean;
}

interface UseFormResult<T> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleSubmit: () => void;
  handleReset: () => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldTouched: (name: keyof T, isTouched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  resetForm: () => void;
}

/**
 * Custom hook for form handling with validation
 */
const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
  validateOnChange = true,
  resetOnSubmit = false
}: UseFormProps<T>): UseFormResult<T> => {
  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Derived state
  const isValid = errors.length === 0;
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);
  
  // Validate form values
  const validateForm = useCallback(() => {
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      return validationErrors.length === 0;
    }
    return true;
  }, [values, validate]);
  
  // Run validation when values change if validateOnChange is true
  useEffect(() => {
    if (validateOnChange && isDirty) {
      validateForm();
    }
  }, [values, validateOnChange, validateForm, isDirty]);
  
  // Handle field change
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setIsDirty(true);
  }, []);
  
  // Set field value without marking it as touched
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }, []);
  
  // Set field touched state
  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);
  
  // Update multiple values at once
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    // Validate form
    const isFormValid = validateForm();
    
    if (isFormValid) {
      // Call onSubmit callback
      onSubmit(values);
      
      // Reset form if resetOnSubmit is true
      if (resetOnSubmit) {
        resetForm();
      } else {
        setIsSubmitting(false);
        setIsDirty(false);
      }
    } else {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, resetOnSubmit, resetForm]);
  
  // Handle form reset
  const handleReset = useCallback(() => {
    resetForm();
  }, [resetForm]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleSubmit,
    handleReset,
    setFieldValue,
    setFieldTouched,
    setValues: setFormValues,
    resetForm
  };
};

export default useForm; 