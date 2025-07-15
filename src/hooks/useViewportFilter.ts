import { useState, useEffect, useCallback, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { ParkingSpotWithStatus } from '../Types/parking';
import { debounce } from '../utils/debounceThrottle';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const useViewportFilter = (
  allSpots: ParkingSpotWithStatus[],
  bufferPercent: number = 0.1 // 10% buffer around viewport
) => {
  const map = useMap();
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);
  const [visibleSpots, setVisibleSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());
  const lastUpdateRef = useRef<number>(0);

  // Debounced bounds update to prevent excessive API calls
  const debouncedUpdateBounds = useCallback(
    debounce(() => {
      if (!map) return;

      const now = Date.now();
      // Prevent updates more frequent than 100ms
      if (now - lastUpdateRef.current < 100) return;
      
      lastUpdateRef.current = now;

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      // Add buffer around viewport
      const latBuffer = (bounds.getNorth() - bounds.getSouth()) * bufferPercent;
      const lngBuffer = (bounds.getEast() - bounds.getWest()) * bufferPercent;

      const newBounds: ViewportBounds = {
        north: bounds.getNorth() + latBuffer,
        south: bounds.getSouth() - latBuffer,
        east: bounds.getEast() + lngBuffer,
        west: bounds.getWest() - lngBuffer,
      };

      setViewportBounds(newBounds);
      setZoomLevel(zoom);
    }, 200), // 200ms debounce
    [map, bufferPercent]
  );

  // Filter spots based on viewport
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

  // Update visible spots when bounds or spots change
  useEffect(() => {
    if (!viewportBounds) {
      debouncedUpdateBounds();
      return;
    }

    const filtered = filterSpotsByViewport(allSpots, viewportBounds);
    setVisibleSpots(filtered);
  }, [allSpots, viewportBounds, filterSpotsByViewport, debouncedUpdateBounds]);

  // Set up map event listeners with debouncing
  useEffect(() => {
    if (!map) return;

    // Initial update
    debouncedUpdateBounds();

    // Listen to map events with additional throttling
    const handleMapEvent = () => {
      debouncedUpdateBounds();
    };

    map.on('moveend', handleMapEvent);
    map.on('zoomend', handleMapEvent);

    return () => {
      map.off('moveend', handleMapEvent);
      map.off('zoomend', handleMapEvent);
    };
  }, [map, debouncedUpdateBounds]);

  return {
    visibleSpots,
    viewportBounds,
    zoomLevel,
    totalSpots: allSpots.length,
    visibleCount: visibleSpots.length
  };
};
