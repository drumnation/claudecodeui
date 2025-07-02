import {describe, it, expect} from 'vitest';
import {
  baseCoverageConfig,
  baseTestConfig,
  createTestSuiteConfig,
} from './base';

describe('Base Vitest Config', () => {
  describe('baseCoverageConfig', () => {
    it('should have correct coverage settings', () => {
      expect(baseCoverageConfig).toBeDefined();
      expect(baseCoverageConfig.enabled).toBe(true);
      expect(baseCoverageConfig.provider).toBe('v8');
    });
  });

  describe('baseTestConfig', () => {
    it('should have correct test settings', () => {
      expect(baseTestConfig).toBeDefined();
      expect(baseTestConfig.globals).toBe(true);
      expect(baseTestConfig.environment).toBe('node');
      expect(baseTestConfig.passWithNoTests).toBe(false);
    });

    it('should have coverage configuration', () => {
      expect(baseTestConfig.coverage).toBeDefined();
      expect(baseTestConfig.coverage?.enabled).toBe(true);
    });
  });

  describe('createTestSuiteConfig', () => {
    it('should create a config with default values', () => {
      const config = createTestSuiteConfig('test-suite');
      expect(config.test).toBeDefined();
      expect(config.test?.name).toBe('test-suite');
      expect(config.test?.environment).toBe(undefined); // Uses base default
    });

    it('should override environment when specified', () => {
      const config = createTestSuiteConfig('test-suite', {
        environment: 'jsdom',
      });
      expect(config.test?.environment).toBe('jsdom');
    });

    it('should merge coverage options', () => {
      const config = createTestSuiteConfig('test-suite', {
        coverage: {
          enabled: false,
        },
      });
      expect(config.test?.coverage?.enabled).toBe(false);
      expect(config.test?.coverage?.provider).toBe('v8'); // From base config
    });
  });
});
