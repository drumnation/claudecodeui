import {describe, it, expect} from 'vitest';
import * as coverage from './coverage';

describe('Coverage Presets', () => {
  it('should export base coverage config with correct defaults', () => {
    expect(coverage.base).toBeDefined();
    expect(coverage.base.provider).toBe('v8');
    expect(coverage.base.enabled).toBe(true);
    expect(coverage.base.thresholds?.statements).toBe(85);
  });

  it('should export strict coverage config with 90% thresholds', () => {
    expect(coverage.strict).toBeDefined();
    expect(coverage.strict.thresholds?.statements).toBe(90);
    expect(coverage.strict.thresholds?.branches).toBe(90);
    expect(coverage.strict.thresholds?.functions).toBe(90);
    expect(coverage.strict.thresholds?.lines).toBe(90);
  });

  it('should export relaxed coverage config with 70% thresholds', () => {
    expect(coverage.relaxed).toBeDefined();
    expect(coverage.relaxed.thresholds?.statements).toBe(70);
  });

  it('should export disabled coverage config', () => {
    expect(coverage.disabled).toBeDefined();
    expect(coverage.disabled.enabled).toBe(false);
    expect(coverage.disabled.provider).toBe('v8');
  });

  it('should export exclude patterns', () => {
    expect(coverage.excludePatterns).toBeDefined();
    expect(Array.isArray(coverage.excludePatterns)).toBe(true);
    expect(coverage.excludePatterns).toContain('**/node_modules/**');
  });

  it('should export include patterns', () => {
    expect(coverage.includePatterns).toBeDefined();
    expect(typeof coverage.includePatterns).toBe('object');
    expect(coverage.includePatterns.source).toBeDefined();
    expect(coverage.includePatterns.source).toContain('src/**/*.{ts,tsx}');
  });
});
