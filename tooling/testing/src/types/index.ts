/**
 * Common types and utilities for testing
 * @packageDocumentation
 */

import type {InlineConfig} from 'vitest';
import type {PlaywrightTestConfig} from '@playwright/test';

/**
 * Test categories for organizing tests
 */
export type TestCategory =
  | 'unit'
  | 'integration'
  | 'e2e'
  | 'performance'
  | 'smoke';

/**
 * Test environment types
 */
export type TestEnvironment = 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime';

/**
 * Common test configuration options
 */
export interface TestConfigOptions {
  /**
   * Test environment
   */
  environment?: TestEnvironment;

  /**
   * Include coverage reports
   */
  coverage?: boolean;

  /**
   * Test timeout in milliseconds
   */
  timeout?: number;

  /**
   * Setup files to run before tests
   */
  setupFiles?: string | string[];

  /**
   * Global variables available in tests
   */
  globals?: boolean;

  /**
   * Run tests in watch mode
   */
  watch?: boolean;
}

/**
 * Extended Vitest configuration
 */
export interface ExtendedVitestConfig extends InlineConfig {
  metadata?: TestMetadata;
}

/**
 * Extended Playwright configuration
 */
export interface ExtendedPlaywrightConfig extends PlaywrightTestConfig {
  metadata?: TestMetadata;
}

/**
 * Test metadata for categorizing and organizing tests
 */
export interface TestMetadata {
  category?: TestCategory;
  tags?: string[];
  priority?: 'critical' | 'high' | 'medium' | 'low';
  owner?: string;
  jiraTicket?: string;
}

/**
 * Test fixture type
 */
export type TestFixture<T> = () => T | Promise<T>;

/**
 * Test data factory type
 */
export type TestFactory<T> = (overrides?: Partial<T>) => T;

/**
 * Mock factory type for creating typed mocks
 */
export type MockFactory<T> = () => {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? import('vitest').MockedFunction<T[K]>
    : T[K];
};

/**
 * Performance test result
 */
export interface PerformanceResult {
  name: string;
  duration: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  timestamp: number;
}

/**
 * Test suite configuration
 */
export interface TestSuiteConfig {
  name: string;
  metadata?: TestMetadata;
  timeout?: number;
  concurrent?: boolean;
  skip?: boolean | string;
  only?: boolean;
  todo?: boolean | string;
}

/**
 * Utility type for deep partial objects
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Utility type for readonly deep objects
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Assertion helpers
 */
export type AssertType<T> = T;
export type AssertEqual<T, U> = T extends U
  ? U extends T
    ? true
    : false
  : false;
export type AssertNotEqual<T, U> = T extends U ? false : true;
