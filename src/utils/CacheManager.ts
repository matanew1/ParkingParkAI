import { ParkingSpotWithStatus } from '../types/parking';

interface CacheConfig {
  maxAge: number;
  capacity: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.config.capacity) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Implement hit rate tracking if needed
    };
  }
}