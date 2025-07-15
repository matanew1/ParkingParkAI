import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { ParkingSpotWithStatus } from '../Types/parking';
import { debounce, throttle } from '../utils/debounceThrottle';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Cache for viewport filtering results
const viewportCache = new Map<string, {
  spots: ParkingSpotWithStatus[],
  timestamp: number,
  bounds: ViewportBounds,
  zoom: number
}>();

const CACHE_DURATION = 5000; // 5 seconds cache
const MIN_UPDATE_INTERVAL = 300; // Minimum 300ms between updates
const ZOOM_THRESHOLD = 0.5; // Only update if zoom changes by more than 0.5

export const useViewportFilter = (
  allSpots: ParkingSpotWithStatus[],
  bufferPercent: number = 0.1
) => {
  const map = useMap();
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);
  const [visibleSpots, setVisibleSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());
  const lastUpdateRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(map.getZoom());
  const isAnimatingRef = useRef<boolean>(false);

  // Create cache key based on bounds and zoom
  const createCacheKey = useCallback((bounds: ViewportBounds, zoom: number) => {
    const roundedZoom = Math.round(zoom * 2) / 2; // Round to nearest 0.5
    return `${bounds.north.toFixed(4)}_${bounds.south.toFixed(4)}_${bounds.east.toFixed(4)}_${bounds.west.toFixed(4)}_${roundedZoom}`;
  }, []);

  // Memoized filter function for better performance
  const filterSpotsByViewport = useCallback((spots: ParkingSpotWithStatus[], bounds: ViewportBounds) => {
    return spots.filter(spot => {
      const lat = spot.lat;
      const lon = spot.lon;
      
      if (isNaN(lat) || isNaN(lon)) return false;
      
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lon >= bounds.west &&
        lon <= bounds.east
      );
    });
  }, []);

  // Optimized bounds update with smarter caching
  const updateBounds = useCallback(() => {
    if (!map || isAnimatingRef.current) return;

    const now = Date.now();
    const currentZoom = map.getZoom();
    
    // Skip update if too soon or zoom change is minimal
    if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL) return;
    if (Math.abs(currentZoom - lastZoomRef.current) < ZOOM_THRESHOLD && viewportBounds) return;
    
    lastUpdateRef.current = now;
    lastZoomRef.current = currentZoom;

    const bounds = map.getBounds();
    
    // Add buffer around viewport
    const latBuffer = (bounds.getNorth() - bounds.getSouth()) * bufferPercent;
    const lngBuffer = (bounds.getEast() - bounds.getWest()) * bufferPercent;

    const newBounds: ViewportBounds = {
      north: bounds.getNorth() + latBuffer,
      south: bounds.getSouth() - latBuffer,
      east: bounds.getEast() + lngBuffer,
      west: bounds.getWest() - lngBuffer,
    };

    const cacheKey = createCacheKey(newBounds, currentZoom);
    const cachedResult = viewportCache.get(cacheKey);
    
    // Use cached result if available and fresh
    if (cachedResult && now - cachedResult.timestamp < CACHE_DURATION) {
      setViewportBounds(cachedResult.bounds);
      setVisibleSpots(cachedResult.spots);
      setZoomLevel(cachedResult.zoom);
      return;
    }

    // Filter spots and cache result
    const filtered = filterSpotsByViewport(allSpots, newBounds);
    
    viewportCache.set(cacheKey, {
      spots: filtered,
      timestamp: now,
      bounds: newBounds,
      zoom: currentZoom
    });

    // Clean old cache entries
    if (viewportCache.size > 50) {
      const oldestKey = Array.from(viewportCache.keys())[0];
      viewportCache.delete(oldestKey);
    }

    setViewportBounds(newBounds);
    setVisibleSpots(filtered);
    setZoomLevel(currentZoom);
  }, [map, bufferPercent, allSpots, viewportBounds, createCacheKey, filterSpotsByViewport]);

  // Throttled update bounds for better performance
  const throttledUpdateBounds = useCallback(
    throttle(updateBounds, 200), // 200ms throttle
    [updateBounds]
  );

  // Track map animation state to prevent updates during animations
  useEffect(() => {
    if (!map) return;

    const handleAnimationStart = () => {
      isAnimatingRef.current = true;
    };

    const handleAnimationEnd = () => {
      isAnimatingRef.current = false;
      // Update after animation ends
      setTimeout(throttledUpdateBounds, 100);
    };

    map.on('zoomstart', handleAnimationStart);
    map.on('movestart', handleAnimationStart);
    map.on('zoomend', handleAnimationEnd);
    map.on('moveend', handleAnimationEnd);

    // Initial update
    throttledUpdateBounds();

    return () => {
      map.off('zoomstart', handleAnimationStart);
      map.off('movestart', handleAnimationStart);
      map.off('zoomend', handleAnimationEnd);
      map.off('moveend', handleAnimationEnd);
    };
  }, [map, throttledUpdateBounds]);

  // Memoized return values to prevent unnecessary re-renders
  const memoizedResult = useMemo(() => ({
    visibleSpots,
    viewportBounds,
    zoomLevel: Math.round(zoomLevel * 10) / 10, // Round to 1 decimal place
    totalSpots: allSpots.length,
    visibleCount: visibleSpots.length
  }), [visibleSpots, viewportBounds, zoomLevel, allSpots.length]);

  return memoizedResult;
};
