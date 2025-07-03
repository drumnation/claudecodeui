/**
 * @kit/logger
 * 
 * Universal logger with environment detection.
 * Automatically exports the appropriate implementation based on the runtime.
 */

import type { Logger, LoggerOptions, LogLevel, LogEntry, LoggerTransport } from './types.js';
import { themes, getThemeByName, isValidTheme, resolveTheme, type ThemeDefinition, type ThemeName } from './themes.js';

// Environment detection
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Dynamic imports based on environment
let createLogger: (options?: LoggerOptions) => Logger;
let defaultLogger: Logger;

if (isBrowser) {
  // Browser environment
  const browserModule = await import('./browser.js');
  createLogger = browserModule.createLogger;
  defaultLogger = browserModule.defaultLogger;
} else if (isNode) {
  // Node.js environment
  const nodeModule = await import('./node.js');
  createLogger = nodeModule.createLogger;
  defaultLogger = nodeModule.defaultLogger;
} else {
  // Fallback for unknown environments
  throw new Error('@kit/logger: Unable to detect runtime environment (browser or Node.js)');
}

// Re-export everything
export { createLogger, defaultLogger };
export type { Logger, LoggerOptions, LogLevel, LogEntry, LoggerTransport };

// Export theme functionality
export { themes, getThemeByName, isValidTheme, resolveTheme };
export type { ThemeDefinition, ThemeName };

// Export React integration if in browser
export * from './react.js';

// Export render tracker for performance monitoring
export * from './renderTracker.js';