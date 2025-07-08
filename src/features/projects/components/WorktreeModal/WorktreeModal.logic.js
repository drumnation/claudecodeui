export const validateFeatureName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Feature name is required' };
  }
  
  const trimmedName = name.trim();
  
  // Check for valid git branch name format
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(trimmedName)) {
    return { isValid: false, error: 'Invalid branch name. Use only letters, numbers, hyphens, and underscores' };
  }
  
  // Check for reserved names
  const reservedNames = ['HEAD', 'main', 'master', 'develop'];
  if (reservedNames.includes(trimmedName)) {
    return { isValid: false, error: 'Cannot use reserved branch names' };
  }
  
  // Check length
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Feature name too long (max 50 characters)' };
  }
  
  return { isValid: true, error: null };
};

export const isCreateButtonDisabled = (featureName, isCreating) => {
  const validation = validateFeatureName(featureName);
  return !validation.isValid || isCreating;
};