// File type definitions
const CODE_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'];
const DOC_EXTENSIONS = ['md', 'txt', 'doc', 'pdf'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];

/**
 * Determines if a file is an image based on its extension
 * @param {string} filename - The name of the file
 * @returns {boolean} True if the file is an image
 */
export const isImageFile = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
};

/**
 * Gets the appropriate file type based on extension
 * @param {string} filename - The name of the file
 * @returns {'code' | 'document' | 'image' | 'default'} The file type
 */
export const getFileType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (CODE_EXTENSIONS.includes(ext)) {
    return 'code';
  } else if (DOC_EXTENSIONS.includes(ext)) {
    return 'document';
  } else if (IMAGE_EXTENSIONS.includes(ext)) {
    return 'image';
  }
  return 'default';
};

/**
 * Calculates the padding level for nested items
 * @param {number} level - The nesting level
 * @returns {number} The padding in pixels
 */
export const calculatePadding = (level) => {
  return level * 16 + 12;
};

/**
 * Creates a file object for the editor
 * @param {Object} item - The file item
 * @param {Object} project - The selected project
 * @returns {Object} The file object for the editor
 */
export const createFileObject = (item, project) => ({
  name: item.name,
  path: item.path,
  projectPath: project.path,
  projectName: project.name
});

/**
 * Toggles a directory in the expanded set
 * @param {Set} expandedDirs - Current set of expanded directories
 * @param {string} path - Path to toggle
 * @returns {Set} New set with toggled directory
 */
export const toggleExpandedDirectory = (expandedDirs, path) => {
  const newExpanded = new Set(expandedDirs);
  if (newExpanded.has(path)) {
    newExpanded.delete(path);
  } else {
    newExpanded.add(path);
  }
  return newExpanded;
};