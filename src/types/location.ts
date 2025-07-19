// src/Types/location.ts
import { ParkingSpotWithStatus } from "./parking";
import { Coordinates } from "../Services/routeService";

/**
 * Props for LocationMarker component
 */
export interface LocationMarkerProps {
  setUserLocation: (location: Coordinates) => void;
}

/**
 * Props for MapController component
 */
export interface MapControllerProps {
  center: Coordinates;
}

/**
 * Props for ParkingMap component
 */
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

/**
 * Type definition for ParkingContext
 */
export interface ParkingContextType {
  // Parking data states
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  error: string | null;
  statusError: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;

  // Map states
  mapCenter: Coordinates;
  userLocation: Coordinates | null;
  showLocationMarker: boolean;
  routes: Coordinates[][];
  selectedSpot: string | null;

  // Actions
  fetchParkingData: (isManualRefresh?: boolean) => Promise<void>;
  setMapCenter: (center: Coordinates) => void;
  setUserLocation: (location: Coordinates | null) => void;
  setShowLocationMarker: (show: boolean) => void;
  setSelectedSpot: (id: string | null) => void;
  setRoutes: (routes: Coordinates[][]) => void;
  handleResetMap: () => void;
  fetchUserLocation: () => Promise<Coordinates>;
  fetchRoute: (
    start: Coordinates,
    end: Coordinates | string,
    options?: any
  ) => Promise<any>;
  centerOnUserLocation: () => void;
}

/**
 * Type definition for AI option
 */
export interface AIOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}
