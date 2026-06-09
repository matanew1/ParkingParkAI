// src/Types/location.ts

import type { ParkingSpotWithStatus } from './parking';

export type Coordinates = [number, number];

export interface LocationMarkerProps {
  setUserLocation: (coords: Coordinates) => void;
}

export interface ParkingMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  statusError: string | null;
  mapCenter: Coordinates;
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  setMapCenter: (center: Coordinates) => void;
  selectedSpotId: string | null;
  onResetMap: () => void;
  onSpotClick?: (spot: ParkingSpotWithStatus) => void;
}
