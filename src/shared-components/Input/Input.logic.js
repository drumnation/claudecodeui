/**
 * Input validation functions
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {string} Error message or empty string
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return '';
};

/**
 * Validates required field
 * @param {string} value - Value to validate
 * @returns {string} Error message or empty string
 */
export const validateRequired = (value) => {
  if (!value || value.trim() === '') {
    return 'This field is required';
  }
  return '';
};

/**
 * Validates minimum length
 * @param {number} minLength - Minimum length
 * @returns {Function} Validation function
 */
export const validateMinLength = (minLength) => (value) => {
  if (value && value.length < minLength) {
    return `Must be at least ${minLength} characters`;
  }
  return '';
};

/**
 * Validates maximum length
 * @param {number} maxLength - Maximum length
 * @returns {Function} Validation function
 */
export const validateMaxLength = (maxLength) => (value) => {
  if (value && value.length > maxLength) {
    return `Must be no more than ${maxLength} characters`;
  }
  return '';
};

/**
 * Validates numeric input
 * @param {string} value - Value to validate
 * @returns {string} Error message or empty string
 */
export const validateNumeric = (value) => {
  if (value && isNaN(value)) {
    return 'Must be a number';
  }
  return '';
};

/**
 * Validates pattern match
 * @param {RegExp} pattern - Pattern to match
 * @param {string} message - Error message
 * @returns {Function} Validation function
 */
export const validatePattern = (pattern, message) => (value) => {
  if (value && !pattern.test(value)) {
    return message;
  }
  return '';
};

/**
 * Combines multiple validators
 * @param {...Function} validators - Validation functions
 * @returns {Function} Combined validation function
 */
export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return '';
};

/**
 * Formats input value
 */

/**
 * Formats phone number
 * @param {string} value - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return value;
};

/**
 * Formats currency
 * @param {string} value - Value to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value) => {
  const number = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  if (isNaN(number)) {
    return value;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
};

/**
 * Masks input value
 * @param {string} value - Value to mask
 * @param {string} mask - Mask pattern (e.g., '###-##-####' for SSN)
 * @returns {string} Masked value
 */
export const maskValue = (value, mask) => {
  const cleaned = value.replace(/\D/g, '');
  let result = '';
  let valueIndex = 0;
  
  for (let i = 0; i < mask.length && valueIndex < cleaned.length; i++) {
    if (mask[i] === '#') {
      result += cleaned[valueIndex];
      valueIndex++;
    } else {
      result += mask[i];
    }
  }
  
  return result;
};

/**
 * Debounces input value
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};