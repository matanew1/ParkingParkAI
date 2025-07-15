import { ParkingSpotWithStatus } from '../Types/parking';

export interface ViewportCache {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  data: ParkingSpotWithStatus[];
  timestamp: number;
  zoomLevel: number;
}

export class SpatialCacheManager {
  private cache: Map<string, ViewportCache> = new Map();
  private maxCacheSize: number = 20; // Maximum number of cached regions
  private maxAge: number = 10 * 60 * 1000; // 10 minutes

  // Generate a cache key based on viewport bounds
  private generateCacheKey(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoomLevel: number): string {
    // Round to reduce cache fragmentation
    const precision = zoomLevel > 15 ? 4 : 3;
    const north = parseFloat(bounds.north.toFixed(precision));
    const south = parseFloat(bounds.south.toFixed(precision));
    const east = parseFloat(bounds.east.toFixed(precision));
    const west = parseFloat(bounds.west.toFixed(precision));
    
    return `${north}_${south}_${east}_${west}_${Math.floor(zoomLevel)}`;
  }

  // Check if bounds overlap with cached region
  private boundsOverlap(bounds1: any, bounds2: any): boolean {
    return !(
      bounds1.east < bounds2.west ||
      bounds1.west > bounds2.east ||
      bounds1.north < bounds2.south ||
      bounds1.south > bounds2.north
    );
  }

  // Get cached data for a viewport
  getCachedData(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoomLevel: number): ParkingSpotWithStatus[] | null {
    const key = this.generateCacheKey(bounds, zoomLevel);
    const cached = this.cache.get(key);

    if (cached) {
      // Check if cache is still valid
      if (Date.now() - cached.timestamp < this.maxAge) {
        console.log(`Cache hit for viewport: ${key}`);
        return cached.data;
      } else {
        // Remove expired cache
        this.cache.delete(key);
      }
    }

    // Check for overlapping cached regions
    for (const [cacheKey, cacheData] of this.cache.entries()) {
      if (
        Math.abs(cacheData.zoomLevel - zoomLevel) <= 1 && // Similar zoom level
        this.boundsOverlap(bounds, cacheData.bounds) &&
        Date.now() - cacheData.timestamp < this.maxAge
      ) {
        // Filter data for the requested bounds
        const filteredData = cacheData.data.filter(spot => 
          spot.lat >= bounds.south &&
          spot.lat <= bounds.north &&
          spot.lon >= bounds.west &&
          spot.lon <= bounds.east
        );
        
        if (filteredData.length > 0) {
          console.log(`Partial cache hit from ${cacheKey} for ${key}`);
          return filteredData;
        }
      }
    }

    return null;
  }

  // Cache data for a viewport
  setCachedData(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoomLevel: number, data: ParkingSpotWithStatus[]): void {
    const key = this.generateCacheKey(bounds, zoomLevel);
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      bounds,
      data: [...data], // Create a copy to avoid reference issues
      timestamp: Date.now(),
      zoomLevel
    });

    console.log(`Cached ${data.length} parking spots for viewport: ${key}`);

    // Also cache in localStorage as backup
    this.saveToLocalStorage();
  }

  // Save cache to localStorage
  private saveToLocalStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        ...value
      }));
      localStorage.setItem('spatialParkingCache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save spatial cache to localStorage:', error);
    }
  }

  // Load cache from localStorage
  loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('spatialParkingCache');
      if (saved) {
        const cacheData = JSON.parse(saved);
        this.cache.clear();
        
        cacheData.forEach((item: any) => {
          // Only load non-expired cache entries
          if (Date.now() - item.timestamp < this.maxAge) {
            this.cache.set(item.key, {
              bounds: item.bounds,
              data: item.data,
              timestamp: item.timestamp,
              zoomLevel: item.zoomLevel
            });
          }
        });
        
        console.log(`Loaded ${this.cache.size} cached regions from localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load spatial cache from localStorage:', error);
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    localStorage.removeItem('spatialParkingCache');
    console.log('Spatial cache cleared');
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    regions: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      regions: Array.from(this.cache.keys())
    };
  }
}
