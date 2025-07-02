// Browser-safe environment variable utilities
// This module provides utilities for accessing environment variables in browser environments
// It works with bundlers like Vite, Webpack, etc. that inject env vars at build time

export interface BrowserEnvOptions {
  prefix?: string;
  debug?: boolean;
}

/**
 * Get environment variable value in browser context
 * Works with Vite (import.meta.env), webpack (process.env), and window globals
 */
export function getEnv(
  name: string,
  defaultValue?: string,
): string | undefined {
  // Check import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[name];
    if (value !== undefined) return String(value);
  }

  // Check process.env (webpack/bundlers)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[name];
    if (value !== undefined) return value;
  }

  // Check window globals (runtime injection)
  if (typeof window !== 'undefined' && typeof window === 'object') {
    const windowEnv = (window as any).__ENV__;
    if (windowEnv && typeof windowEnv === 'object') {
      const value = windowEnv[name];
      if (value !== undefined) return value;
    }
  }

  return defaultValue;
}

/**
 * Get required environment variable, throws if not found
 */
export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Required environment variable ${name} is not defined`);
  }
  return value;
}

/**
 * Get integer environment variable
 */
export function getIntEnv(
  name: string,
  defaultValue?: number,
): number | undefined {
  const value = getEnv(name);
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get boolean environment variable
 */
export function getBoolEnv(
  name: string,
  defaultValue?: boolean,
): boolean | undefined {
  const value = getEnv(name)?.toLowerCase();
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get all environment variables with optional prefix filter
 * Only returns public/safe variables based on prefix
 */
export function getFilteredEnv(
  options: BrowserEnvOptions = {},
): Record<string, string> {
  const {prefix = 'VITE_', debug = false} = options;
  const env: Record<string, string> = {};

  // Collect from import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const [key, value] of Object.entries(import.meta.env)) {
      if ((!prefix || key.startsWith(prefix)) && typeof value === 'string') {
        env[key] = value;
      }
    }
  }

  // Collect from process.env
  if (typeof process !== 'undefined' && process.env) {
    for (const [key, value] of Object.entries(process.env)) {
      if ((!prefix || key.startsWith(prefix)) && typeof value === 'string') {
        env[key] = value;
      }
    }
  }

  // Collect from window.__ENV__
  if (typeof window !== 'undefined' && typeof window === 'object') {
    const windowEnv = (window as any).__ENV__;
    if (windowEnv && typeof windowEnv === 'object') {
      for (const [key, value] of Object.entries(windowEnv)) {
        if ((!prefix || key.startsWith(prefix)) && typeof value === 'string') {
          env[key] = value;
        }
      }
    }
  }

  if (debug) {
    console.log(
      `Found ${Object.keys(env).length} environment variables with prefix "${prefix}"`,
    );
  }

  return env;
}

/**
 * Initialize browser environment from runtime config
 * Useful for injecting environment variables at runtime rather than build time
 */
export function initBrowserEnv(env: Record<string, string>): void {
  if (typeof window !== 'undefined' && typeof window === 'object') {
    (window as any).__ENV__ = {...(window as any).__ENV__, ...env};
  }
}
