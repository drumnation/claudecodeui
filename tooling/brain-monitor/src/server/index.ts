/**
 * Brain-Monitor Server Module
 * 
 * Provides server-side utilities for receiving and processing
 * browser console logs and other monitoring data.
 */

export { 
  handleBrowserLogs, 
  createBrainMonitorRouter 
} from './browser-logs-handler.js';