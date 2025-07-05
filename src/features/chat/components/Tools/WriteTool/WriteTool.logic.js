export const parseToolInput = (toolInput) => {
  try {
    return typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput;
  } catch (e) {
    return null;
  }
};

export const extractFilenameFromPath = (filePath) => {
  if (!filePath) return '';
  const parts = filePath.split('/');
  return parts[parts.length - 1] || filePath;
};