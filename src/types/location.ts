export interface LocationMarkerProps {
  setUserLocation: (location: [number, number]) => void;
}

export interface MapControllerProps {
  center: [number, number];
}

export interface ParkingMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  statusError: string | null;
  mapCenter: [number, number];
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  setMapCenter: (center: [number, number]) => void;
  selectedMarkerIcon: string | null;
}

export interface ParkingContextType {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  error: string | null;
  statusError: string | null;
  routes: Coordinates[][]; // Ensure this is always an array
  lastUpdated: Date | null;
  refreshing: boolean;
  mapCenter: [number, number];
  userLocation: [number, number] | null;
  showLocationMarker: boolean;
  fetchParkingData: (isManualRefresh?: boolean) => Promise<void>;
  setMapCenter: (center: [number, number]) => void;
  setUserLocation: (location: [number, number]) => void;
  setShowLocationMarker: (show: boolean) => void;
  selectedSpot: string | null;
  setSelectedSpot: (id: string | null) => void;
}

export interface ParkingMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  statusError: string | null;
  mapCenter: [number, number];
  refreshing: boolean;
  onRefresh: () => void;
  setMapCenter: (center: [number, number]) => void;
  selectedSpotId: string | null;
}

// types/ai.ts (if not already present)
export type Coordinates = [number, number];