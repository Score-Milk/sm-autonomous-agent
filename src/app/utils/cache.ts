export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// biome-ignore lint/style/noMagicNumbers: 5 minutes
export const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Simple in-memory cache implementation
 */
export class SimpleCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = CACHE_TTL_MS): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}
