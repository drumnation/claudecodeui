export const validateProjectPath = (path) => {
  if (!path || !path.trim()) {
    return { isValid: false, error: 'Path is required' };
  }
  
  const trimmedPath = path.trim();
  
  if (trimmedPath.includes('..')) {
    return { isValid: false, error: 'Path cannot contain ..' };
  }
  
  if (!trimmedPath.startsWith('/') && !trimmedPath.match(/^[a-zA-Z0-9-_]+/)) {
    return { isValid: false, error: 'Path must be absolute or a valid relative path' };
  }
  
  return { isValid: true, error: null };
};

export const isCreateButtonDisabled = (path, isCreating) => {
  const validation = validateProjectPath(path);
  return !validation.isValid || isCreating;
};