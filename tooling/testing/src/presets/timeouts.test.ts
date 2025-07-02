import {describe, it, expect} from 'vitest';
import * as timeouts from './timeouts';

describe('Timeout Presets', () => {
  it('should export fast timeout preset', () => {
    expect(timeouts.fast).toBeDefined();
    expect(timeouts.fast.testTimeout).toBe(10000);
    expect(timeouts.fast.hookTimeout).toBe(10000);
  });

  it('should export medium timeout preset', () => {
    expect(timeouts.medium).toBeDefined();
    expect(timeouts.medium.testTimeout).toBe(30000);
    expect(timeouts.medium.hookTimeout).toBe(30000);
  });

  it('should export slow timeout preset', () => {
    expect(timeouts.slow).toBeDefined();
    expect(timeouts.slow.testTimeout).toBe(60000);
    expect(timeouts.slow.hookTimeout).toBe(60000);
  });

  it('should export ci timeout preset', () => {
    expect(timeouts.ci).toBeDefined();
    // CI timeouts are conditional based on CI environment
    expect(timeouts.ci.testTimeout).toBe(process.env.CI ? 20000 : 15000);
    expect(timeouts.ci.hookTimeout).toBe(process.env.CI ? 20000 : 15000);
  });
});
