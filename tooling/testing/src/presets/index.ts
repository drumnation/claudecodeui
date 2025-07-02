/**
 * Test configuration presets
 * Reusable settings for consistent test configuration
 */

export * as coverage from './coverage';
export * as timeouts from './timeouts';
export * as pools from './pools';
export * as reporters from './reporters';

// Re-export commonly used items at top level
export {CoverageMultiplierReporter} from './reporters';
export {excludePatterns, includePatterns} from './coverage';
