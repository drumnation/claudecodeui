import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing input state and validation
 * @param {Object} options - Hook options
 * @param {string} options.initialValue - Initial value of the input
 * @param {Function} options.validate - Validation function
 * @param {Function} options.onChange - Change handler
 * @returns {Object} Input state and handlers
 */
export const useInput = ({ initialValue = '', validate, onChange } = {}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (validate && touched) {
      const validationError = validate(newValue);
      setError(validationError || '');
    }
    
    if (onChange) {
      onChange(e);
    }
  }, [validate, touched, onChange]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validate) {
      const validationError = validate(value);
      setError(validationError || '');
    }
  }, [validate, value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  }, [initialValue]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    value,
    error,
    touched,
    inputRef,
    handleChange,
    handleBlur,
    reset,
    focus,
    isValid: !error && touched,
  };
};

/**
 * Hook for managing controlled/uncontrolled input state
 */
export const useControlledInput = ({ value: valueProp, defaultValue, onChange }) => {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const value = isControlled ? valueProp : internalValue;
  
  const handleChange = useCallback((e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  }, [isControlled, onChange]);
  
  return {
    value,
    onChange: handleChange,
    isControlled,
  };
};