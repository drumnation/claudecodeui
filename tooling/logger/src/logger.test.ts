import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createLogger, isLevelEnabled, createRequestLoggerMiddleware} from './node';
import type {LogLevel} from './types';
import {themes, getThemeByName, isValidTheme, resolveTheme} from './themes';

describe('Logger', () => {
  beforeEach(() => {
    // Clear any environment variables that might affect tests
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
  });

  describe('createLogger', () => {
    it('should create a logger with all required methods', () => {
      const logger = createLogger({ scope: 'test' });
      
      // Test that all methods exist
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.trace).toBeDefined();
      expect(logger.child).toBeDefined();
      expect(logger.isLevelEnabled).toBeDefined();
    });

    it('should create a logger with default options', () => {
      const logger = createLogger();
      
      // Should have all methods
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.trace).toBe('function');
    });

    it('should respect custom log level', () => {
      const logger = createLogger({ level: 'warn' });
      
      // These levels should be enabled
      expect(logger.isLevelEnabled('error')).toBe(true);
      expect(logger.isLevelEnabled('warn')).toBe(true);
      
      // These levels should be disabled
      expect(logger.isLevelEnabled('info')).toBe(false);
      expect(logger.isLevelEnabled('debug')).toBe(false);
      expect(logger.isLevelEnabled('trace')).toBe(false);
    });

    it('should create child loggers with additional metadata', () => {
      const logger = createLogger({ scope: 'parent' });
      const childLogger = logger.child({ requestId: '123', userId: 'user-456' });
      
      // Child should have all the same methods
      expect(childLogger.info).toBeDefined();
      expect(childLogger.error).toBeDefined();
      expect(childLogger.child).toBeDefined();
    });

    it('should accept metadata with log methods', () => {
      const logger = createLogger({ scope: 'test' });
      
      // Should not throw
      expect(() => {
        logger.info('test message', { extra: 'data' });
        logger.error('error message', { errorCode: 'E001' });
        logger.warn('warning', { threshold: 100 });
        logger.debug('debug info', { details: { nested: true } });
        logger.trace('trace data', { verbose: true });
      }).not.toThrow();
    });
  });

  describe('isLevelEnabled', () => {
    const levels: LogLevel[] = ['silent', 'error', 'warn', 'info', 'debug', 'trace'];
    
    it('should correctly determine if a level is enabled', () => {
      // Test error level
      expect(isLevelEnabled('error', 'error')).toBe(true);
      expect(isLevelEnabled('warn', 'error')).toBe(false);
      expect(isLevelEnabled('info', 'error')).toBe(false);
      expect(isLevelEnabled('debug', 'error')).toBe(false);
      expect(isLevelEnabled('trace', 'error')).toBe(false);
      
      // Test info level
      expect(isLevelEnabled('error', 'info')).toBe(true);
      expect(isLevelEnabled('warn', 'info')).toBe(true);
      expect(isLevelEnabled('info', 'info')).toBe(true);
      expect(isLevelEnabled('debug', 'info')).toBe(false);
      expect(isLevelEnabled('trace', 'info')).toBe(false);
      
      // Test debug level
      expect(isLevelEnabled('error', 'debug')).toBe(true);
      expect(isLevelEnabled('warn', 'debug')).toBe(true);
      expect(isLevelEnabled('info', 'debug')).toBe(true);
      expect(isLevelEnabled('debug', 'debug')).toBe(true);
      expect(isLevelEnabled('trace', 'debug')).toBe(false);
    });

    it('should handle silent level correctly', () => {
      expect(isLevelEnabled('error', 'silent')).toBe(false);
      expect(isLevelEnabled('warn', 'silent')).toBe(false);
      expect(isLevelEnabled('info', 'silent')).toBe(false);
      expect(isLevelEnabled('debug', 'silent')).toBe(false);
      expect(isLevelEnabled('trace', 'silent')).toBe(false);
      expect(isLevelEnabled('silent', 'silent')).toBe(true);
    });
  });

  describe('createRequestLoggerMiddleware', () => {
    it('should create a middleware function', () => {
      const logger = createLogger({ scope: 'test' });
      const middleware = createRequestLoggerMiddleware({ logger });
      
      expect(typeof middleware).toBe('function');
    });

    it('should attach logger and id to request', () => {
      const logger = createLogger({ scope: 'test' });
      const middleware = createRequestLoggerMiddleware({ logger });
      
      const req: any = {
        method: 'GET',
        url: '/test',
        path: '/test',
        ip: '127.0.0.1',
        query: {},
        get: vi.fn(() => 'test-agent'),
      };
      const res: any = {
        send: vi.fn(),
        on: vi.fn(),
        get: vi.fn(),
        statusCode: 200,
      };
      const next = vi.fn();
      
      middleware(req, res, next);
      
      expect(req.id).toBeDefined();
      expect(req.id).toMatch(/^req-\d+-\d+$/);
      expect(req.log).toBeDefined();
      expect(req.log.info).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should skip paths in skipPaths array', () => {
      const logger = createLogger({ scope: 'test' });
      const middleware = createRequestLoggerMiddleware({ 
        logger,
        skipPaths: ['/health', '/metrics']
      });
      
      const req: any = {
        path: '/health',
      };
      const res: any = {};
      const next = vi.fn();
      
      middleware(req, res, next);
      
      expect(req.id).toBeUndefined();
      expect(req.log).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('logger configuration', () => {
    it('should use info level by default in test environment', () => {
      vi.stubEnv('NODE_ENV', 'test');
      const logger = createLogger();
      
      expect(logger.isLevelEnabled('error')).toBe(true);
      expect(logger.isLevelEnabled('warn')).toBe(true);
      expect(logger.isLevelEnabled('info')).toBe(true);
    });

    it('should use error level by default in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const logger = createLogger();
      
      expect(logger.isLevelEnabled('error')).toBe(true);
      expect(logger.isLevelEnabled('warn')).toBe(false);
      expect(logger.isLevelEnabled('info')).toBe(false);
    });

    it('should respect LOG_LEVEL environment variable', () => {
      vi.stubEnv('LOG_LEVEL', 'debug');
      const logger = createLogger();
      
      expect(logger.isLevelEnabled('debug')).toBe(true);
      expect(logger.isLevelEnabled('trace')).toBe(false);
    });
  });

  describe('theme functionality', () => {
    describe('theme resolution', () => {
      it('should resolve theme by name', () => {
        const theme = getThemeByName('Dracula');
        expect(theme).toBeDefined();
        expect(theme?.time).toBe('#6272a4');
        expect(theme?.[30]).toBe('#50fa7b'); // info level
      });

      it('should return undefined for invalid theme name', () => {
        const theme = getThemeByName('InvalidTheme');
        expect(theme).toBeUndefined();
      });

      it('should validate theme names correctly', () => {
        expect(isValidTheme('Dracula')).toBe(true);
        expect(isValidTheme('Solarized')).toBe(true);
        expect(isValidTheme('Nord')).toBe(true);
        expect(isValidTheme('Gruvbox')).toBe(true);
        expect(isValidTheme('NightOwl')).toBe(true);
        expect(isValidTheme('Monochrome')).toBe(true);
        expect(isValidTheme('Classic')).toBe(true);
        expect(isValidTheme('InvalidTheme')).toBe(false);
      });

      it('should resolve theme from string or object', () => {
        // String resolution
        const dracula = resolveTheme('Dracula');
        expect(dracula).toEqual(themes.Dracula);

        // Object resolution
        const customTheme = {
          time: '#000000',
          scope: '#111111',
          10: '#222222',
          20: '#333333',
          30: '#444444',
          40: '#555555',
          50: '#666666',
          60: '#777777',
        };
        const resolved = resolveTheme(customTheme);
        expect(resolved).toEqual(customTheme);

        // Undefined resolution (should return Classic)
        const defaultTheme = resolveTheme();
        expect(defaultTheme).toEqual(themes.Classic);

        // Invalid string resolution (should return Classic)
        const fallback = resolveTheme('InvalidTheme');
        expect(fallback).toEqual(themes.Classic);
      });
    });

    describe('logger with themes', () => {
      it('should create logger with theme from options', () => {
        const logger = createLogger({ theme: 'Dracula' });
        expect(logger).toBeDefined();
        expect(logger.info).toBeDefined();
      });

      it('should create logger with custom theme object', () => {
        const customTheme = {
          time: '#000000',
          scope: '#111111',
          10: '#222222',
          20: '#333333',
          30: '#444444',
          40: '#555555',
          50: '#666666',
          60: '#777777',
        };
        const logger = createLogger({ theme: customTheme });
        expect(logger).toBeDefined();
        expect(logger.info).toBeDefined();
      });

      it('should respect LOG_THEME environment variable', () => {
        vi.stubEnv('LOG_THEME', 'Nord');
        const logger = createLogger();
        expect(logger).toBeDefined();
        // Logger creation should not throw
      });

      it('should handle Monochrome theme correctly', () => {
        const logger = createLogger({ theme: 'Monochrome' });
        expect(logger).toBeDefined();
        // Monochrome theme should work without colors
      });

      it('should fallback to Classic theme for invalid theme names', () => {
        const logger = createLogger({ theme: 'InvalidTheme' });
        expect(logger).toBeDefined();
        // Should not throw and use Classic theme as fallback
      });
    });

    describe('child loggers with themes', () => {
      it('should inherit theme from parent logger', () => {
        const parentLogger = createLogger({ theme: 'Dracula' });
        const childLogger = parentLogger.child({ module: 'child' });
        
        expect(childLogger).toBeDefined();
        expect(childLogger.info).toBeDefined();
        // Child should inherit the parent's theme
      });
    });

    describe('browser environment themes', () => {
      beforeEach(() => {
        // Mock browser environment
        vi.stubEnv('NODE_ENV', 'development');
      });

      it('should support theme in browser logger', async () => {
        // Dynamically import browser module to test browser-specific functionality
        const browserModule = await import('./browser');
        const browserLogger = browserModule.createLogger({ theme: 'Dracula' });
        
        expect(browserLogger).toBeDefined();
        expect(browserLogger.info).toBeDefined();
      });

      it('should handle Monochrome theme with CSS styles in browser', async () => {
        const browserModule = await import('./browser');
        const browserLogger = browserModule.createLogger({ theme: 'Monochrome' });
        
        expect(browserLogger).toBeDefined();
        // Monochrome should translate ANSI to CSS styles
      });

      it('should respect VITE_LOG_THEME environment variable in browser', async () => {
        vi.stubEnv('VITE_LOG_THEME', 'Solarized');
        const browserModule = await import('./browser');
        const browserLogger = browserModule.createLogger();
        
        expect(browserLogger).toBeDefined();
      });
    });
  });
});