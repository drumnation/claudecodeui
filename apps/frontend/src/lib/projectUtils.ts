/**
 * Shared utility module for consistent project path encoding/decoding
 * between frontend and backend.
 */

/**
 * Encodes a filesystem path to a project name identifier
 * Converts: /Users/dmieloch/Dev/experiments/cc-ui/claudecodeui
 * To: Users-dmieloch-Dev-experiments-cc-ui-claudecodeui
 * @param {string} path - Absolute filesystem path
 * @returns {string} Encoded project name without leading dash
 */
export function encodeProjectPath(path: any) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Remove leading slash and replace all slashes with dashes
  // This ensures consistency with backend expectations
  return path.replace(/^\//, '').replace(/\//g, '-');
}

/**
 * Decodes a project name identifier to a filesystem path
 * Handles both formats for backward compatibility:
 * - With leading dash: -Users-dmieloch-Dev-experiments-cc-ui-claudecodeui
 * - Without leading dash: Users-dmieloch-Dev-experiments-cc-ui-claudecodeui
 * @param {string} encodedName - Encoded project name
 * @returns {string} Absolute filesystem path
 */
export function decodeProjectPath(encodedName: any) {
  if (!encodedName || typeof encodedName !== 'string') {
    return '';
  }

  // Remove leading dash if present for normalization
  const normalized = encodedName.replace(/^-/, '');

  // Replace dashes with slashes and add leading slash
  return `/${normalized.replace(/-/g, '/')}`;
}

/**
 * Normalizes a project identifier by removing leading dashes
 * This ensures compatibility between frontend and backend formats
 * @param {string} projectId - Project identifier (may have leading dash)
 * @returns {string} Normalized project identifier without leading dash
 */
export function normalizeProjectId(projectId: any) {
  if (!projectId || typeof projectId !== 'string') {
    return '';
  }

  return projectId.replace(/^-/, '');
}

/**
 * Validates if a string is a valid encoded project name
 * @param {string} encodedName - String to validate
 * @returns {boolean} True if valid encoded project name
 */
export function isValidEncodedProjectName(encodedName: any) {
  if (!encodedName || typeof encodedName !== 'string') {
    return false;
  }

  // Valid encoded names contain only alphanumeric, dash, underscore, and dot
  // They should not have consecutive dashes or end with a dash
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  const hasConsecutiveDashes = /--/;
  const endsWithDash = /-$/;

  return (
    validPattern.test(encodedName) &&
    !hasConsecutiveDashes.test(encodedName) &&
    !endsWithDash.test(encodedName)
  );
}

/**
 * Extracts project name from a full path
 * @param {string} path - Full filesystem path
 * @returns {string} Project name (last segment of path)
 */
export function getProjectNameFromPath(path: any) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}
