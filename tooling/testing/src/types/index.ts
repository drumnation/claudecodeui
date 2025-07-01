/**
 * Types for testing configurations
 * @packageDocumentation
 */

/**
 * Common test configuration options
 */
export interface TestConfigOptions {
  /**
   * Test environment
   */
  environment?: 'node' | 'jsdom' | 'happy-dom';

  /**
   * Include coverage reports
   */
  coverage?: boolean;

  /**
   * Test timeout in milliseconds
   */
  timeout?: number;
}
