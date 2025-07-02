/**
 * Brain-Monitor Browser Module
 * 
 * Provides browser-side utilities for capturing and monitoring
 * console logs, errors, and performance metrics.
 */

export { 
  initBrowserConsoleCapture, 
  getConsoleCapture,
  type LogEntry,
  type ConsoleCapturConfig 
} from './console-capture.js';