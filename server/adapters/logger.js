/**
 * Centralized logging adapter for better observability and testing
 */

const util = require('util');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.currentLevel = this.levels[this.logLevel] || 2;
  }

  /**
   * Format a log message with timestamp and context
   * @param {string} level - Log level
   * @param {string} context - Logger context/module name
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {string} Formatted log message
   */
  formatMessage(level, context, message, meta) {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
    
    if (meta && Object.keys(meta).length > 0) {
      return `${baseMessage} ${util.inspect(meta, { depth: 3, colors: true })}`;
    }
    
    return baseMessage;
  }

  /**
   * Check if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return this.levels[level] <= this.currentLevel;
  }

  /**
   * Create a logger instance for a specific context
   * @param {string} context - Logger context/module name
   * @returns {Object} Logger instance
   */
  create(context) {
    const self = this;
    
    return {
      error: (message, meta) => self.error(context, message, meta),
      warn: (message, meta) => self.warn(context, message, meta),
      info: (message, meta) => self.info(context, message, meta),
      debug: (message, meta) => self.debug(context, message, meta),
      
      // Convenience methods
      logError: (error, message) => self.logError(context, error, message),
      time: (label) => self.time(context, label),
      timeEnd: (label) => self.timeEnd(context, label)
    };
  }

  /**
   * Log an error message
   * @param {string} context - Logger context
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  error(context, message, meta) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', context, message, meta));
    }
  }

  /**
   * Log a warning message
   * @param {string} context - Logger context
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(context, message, meta) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', context, message, meta));
    }
  }

  /**
   * Log an info message
   * @param {string} context - Logger context
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(context, message, meta) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', context, message, meta));
    }
  }

  /**
   * Log a debug message
   * @param {string} context - Logger context
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(context, message, meta) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', context, message, meta));
    }
  }

  /**
   * Log an Error object with stack trace
   * @param {string} context - Logger context
   * @param {Error} error - Error object
   * @param {string} message - Additional message
   */
  logError(context, error, message) {
    if (this.shouldLog('error')) {
      const errorMeta = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
      
      if (message) {
        this.error(context, message, errorMeta);
      } else {
        this.error(context, error.message, errorMeta);
      }
    }
  }

  /**
   * Start a timer
   * @param {string} context - Logger context
   * @param {string} label - Timer label
   */
  time(context, label) {
    if (this.shouldLog('debug')) {
      const key = `${context}:${label}`;
      this.timers = this.timers || new Map();
      this.timers.set(key, Date.now());
      this.debug(context, `Timer started: ${label}`);
    }
  }

  /**
   * End a timer and log the duration
   * @param {string} context - Logger context
   * @param {string} label - Timer label
   */
  timeEnd(context, label) {
    if (this.shouldLog('debug')) {
      const key = `${context}:${label}`;
      this.timers = this.timers || new Map();
      
      if (this.timers.has(key)) {
        const duration = Date.now() - this.timers.get(key);
        this.timers.delete(key);
        this.debug(context, `Timer ended: ${label}`, { duration: `${duration}ms` });
      } else {
        this.warn(context, `Timer not found: ${label}`);
      }
    }
  }

  /**
   * Set the log level
   * @param {string} level - New log level
   */
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.currentLevel = this.levels[level];
    } else {
      this.warn('Logger', `Invalid log level: ${level}`);
    }
  }

  /**
   * Create a child logger with additional context
   * @param {string} parentContext - Parent context
   * @param {string} childContext - Child context
   * @returns {Object} Child logger
   */
  child(parentContext, childContext) {
    return this.create(`${parentContext}:${childContext}`);
  }

  /**
   * Mock logger for testing
   * @returns {Object} Mock logger that doesn't output
   */
  createMock() {
    return {
      error: () => {},
      warn: () => {},
      info: () => {},
      debug: () => {},
      logError: () => {},
      time: () => {},
      timeEnd: () => {}
    };
  }
}

// Export singleton instance
const logger = new Logger();

// Also export the class for testing
logger.Logger = Logger;

module.exports = logger;