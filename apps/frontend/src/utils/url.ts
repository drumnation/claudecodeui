/**
 * Utility functions for handling URLs in different environments (localhost vs ngrok)
 */

/**
 * Get the appropriate base URL for the current environment
 * @returns {string} The base URL (with protocol and host)
 */
export function getBaseUrl() {
  // Use current window location, which will be ngrok URL when accessed via ngrok
  return window.location.origin;
}

/**
 * Get the appropriate API base URL for the current environment
 * @returns {string} The API base URL
 */
export function getApiBaseUrl() {
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  const currentProtocol = window.location.protocol;

  // If we're on localhost with port 8766 (Vite dev server), API is on 8765
  if (currentHost === 'localhost' && currentPort === '8766') {
    return `${currentProtocol}//localhost:8765`;
  }

  // For ngrok or other environments, API is on the same host
  // The backend server handles both API and serves the built frontend
  return window.location.origin;
}

/**
 * Get the frontend dev server URL for the current environment
 * This is used for preview functionality when showing the dev server
 * @returns {string} The frontend dev server URL
 */
export function getDevServerUrl() {
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;

  // If we're accessed via ngrok, use the same ngrok URL for dev server
  if (currentHost.includes('ngrok.') || currentHost.includes('ngrok-free.')) {
    return window.location.origin;
  }

  // For localhost development, explicitly use localhost:8766
  return `${currentProtocol}//localhost:8766`;
}

/**
 * Check if we're currently running in ngrok environment
 * @returns {boolean} True if accessed via ngrok
 */
export function isNgrokEnvironment() {
  const hostname = window.location.hostname;
  return hostname.includes('ngrok.') || hostname.includes('ngrok-free.');
}

/**
 * Check if we're in local development mode
 * @returns {boolean} True if on localhost
 */
export function isLocalDevelopment() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}
