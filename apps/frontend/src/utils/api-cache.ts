/**
 * API caching layer with automatic invalidation and performance optimization
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  stale: boolean;
}

interface CacheConfig {
  maxAge: number; // milliseconds
  staleWhileRevalidate: number; // milliseconds
  maxEntries: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private config: CacheConfig;

  constructor(
    config: CacheConfig = {
      maxAge: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: 10 * 60 * 1000, // 10 minutes
      maxEntries: 100,
    },
  ) {
    this.config = config;
    this.startCleanupInterval();
  }

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return fresh data immediately
    if (cached && now < cached.expiry && !cached.stale) {
      return cached.data;
    }

    // Return stale data while revalidating in background
    if (cached && now < cached.timestamp + this.config.staleWhileRevalidate) {
      // Return stale data immediately
      const staleData = cached.data;

      // Revalidate in background
      this.revalidateInBackground(key, fetcher);

      return staleData;
    }

    // No valid cache, fetch fresh data
    return this.fetchAndCache(key, fetcher);
  }

  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    // Prevent duplicate requests
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    const promise = fetcher().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);

    try {
      const data = await promise;
      this.set(key, data);
      return data;
    } catch (error) {
      // Remove from pending requests on error
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.set(key, data);
    } catch (error) {
      console.warn(`Background revalidation failed for key: ${key}`, error);
    }
  }

  set<T>(key: string, data: T): void {
    const now = Date.now();

    // Implement LRU eviction
    if (this.cache.size >= this.config.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + this.config.maxAge,
      stale: false,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache) {
        if (now > entry.timestamp + this.config.staleWhileRevalidate) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => this.cache.delete(key));
    }, this.config.maxAge);
  }

  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        stale: entry.stale,
        size: JSON.stringify(entry.data).length,
      })),
    };
  }
}

// Global cache instance
export const apiCache = new ApiCache();

// React hook for cached API calls
export function useCachedApi<T>(
  key: string,
  fetcher: () => Promise<T>,
  enabled = true,
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCache.get(key, fetcher);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, enabled]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = React.useCallback(() => {
    apiCache.invalidate(key);
    fetchData();
  }, [key, fetchData]);

  return {data, loading, error, refetch};
}

// Cache key generators
export const cacheKeys = {
  fileTree: (projectPath: string) => `fileTree:${projectPath}`,
  fileContent: (filePath: string) => `fileContent:${filePath}`,
  gitStatus: (projectPath: string) => `gitStatus:${projectPath}`,
  projectList: () => 'projectList',
  chatHistory: (sessionId: string) => `chatHistory:${sessionId}`,
} as const;

import React from 'react';
