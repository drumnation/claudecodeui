export const parseToolInput = (toolInput) => {
  try {
    return typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput;
  } catch (e) {
    return null;
  }
};

export const getRelevantPathParts = (filePath) => {
  if (!filePath) return { relativePath: '', filename: '' };
  
  const parts = filePath.split('/');
  const filename = parts.pop() || '';
  
  // Show last 2-3 directory parts for context
  const relevantParts = parts.slice(-3);
  const relativePath = relevantParts.length > 0 ? relevantParts.join('/') + '/' : '';
  
  return { relativePath, filename };
};