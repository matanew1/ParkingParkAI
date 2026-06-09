import { create } from "zustand";
import { ParkingSpotWithStatus } from "../Types/parking";
import { ParkingService } from "../Services/parkingService";
import type { Coordinates } from "../Types/location";

export interface ParkingState {
  // Data
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;

  // Map
  mapCenter: Coordinates;
  userLocation: Coordinates | null;
  showLocationMarker: boolean;
  selectedSpot: string | null;
  hasInitiallyLocated: boolean;

  // Actions
  fetchParkingData: (isManualRefresh?: boolean) => Promise<void>;
  handleResetMap: () => void;
  setMapCenter: (center: Coordinates) => void;
  setUserLocation: (location: Coordinates | null) => void;
  setShowLocationMarker: (show: boolean) => void;
  setSelectedSpot: (spot: string | null) => void;
  setHasInitiallyLocated: (located: boolean) => void;
  fetchUserLocation: () => Promise<void>;
  centerOnUserLocation: () => void;
}

const DEFAULT_COORDINATES: Coordinates = [32.0853, 34.7818];

const parkingService = new ParkingService();

// Proxied URLs (via Vercel rewrite) - primary
const AHUZAT_HAHOF_URL = `/api/arcgis/rest/services/IView2/MapServer/970/query?where=1%3D1&outFields=*&f=json`;
const PRIVATE_URL = `/api/arcgis/rest/services/IView2/MapServer/555/query?where=1%3D1&outFields=*&f=json`;

// Direct GIS URLs as fallback for Safari/mobile
const AHUZAT_HAHOF_URL_DIRECT = `https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/970/query?where=1%3D1&outFields=*&f=json`;
const PRIVATE_URL_DIRECT = `https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/555/query?where=1%3D1&outFields=*&f=json`;

export const useParkingStore = create<ParkingState>((set, get) => ({
  // Initial state
  parkingSpots: [],
  loading: true,
  error: null,
  lastUpdated: null,
  refreshing: false,
  mapCenter: DEFAULT_COORDINATES,
  userLocation: null,
  showLocationMarker: false,
  selectedSpot: null,
  hasInitiallyLocated: false,

  // Actions
  fetchParkingData: async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        set({ refreshing: true });
      } else if (!get().lastUpdated) {
        // First load - set loading state
        set({ loading: true, error: null });
      }

      console.log("Fetching parking data...");
      const [combinedAhuzatHahofData, combinedPrivateData] = await Promise.all([
        parkingService.fetchParkingSpots(AHUZAT_HAHOF_URL, "public", isManualRefresh, AHUZAT_HAHOF_URL_DIRECT),
        parkingService.fetchParkingSpots(PRIVATE_URL, "private", isManualRefresh, PRIVATE_URL_DIRECT),
      ]);

      if (
        combinedAhuzatHahofData.length === 0 &&
        combinedPrivateData.length === 0
      ) {
        throw new Error("No parking spots found. The server may be temporarily unavailable.");
      }

      const allSpots = [...combinedAhuzatHahofData, ...combinedPrivateData];

      set({
        parkingSpots: allSpots,
        error: null,
        lastUpdated: new Date(),
      });

      console.log(`Successfully loaded ${allSpots.length} parking spots`);
    } catch (err) {
      console.error("Error fetching parking data:", err);
      
      // Generate user-friendly error message
      let errorMessage = "Failed to load parking data.";
      if (err instanceof Error) {
        if (err.message.includes("Network") || err.message.includes("CORS")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Request timed out. The server is not responding. Try again?";
        } else {
          errorMessage = err.message;
        }
      }
      
      set({
        error: errorMessage,
      });
    } finally {
      set({ loading: false, refreshing: false });
    }
  },

  handleResetMap: () => {
    set({
      mapCenter: DEFAULT_COORDINATES,
      userLocation: null,
      showLocationMarker: false,
      selectedSpot: null,
      hasInitiallyLocated: false,
    });
  },

  setMapCenter: (center: Coordinates) => set({ mapCenter: center }),
  setUserLocation: (location: Coordinates | null) =>
    set({ userLocation: location }),
  setShowLocationMarker: (show: boolean) => set({ showLocationMarker: show }),
  setSelectedSpot: (spot: string | null) => set({ selectedSpot: spot }),
  setHasInitiallyLocated: (located: boolean) =>
    set({ hasInitiallyLocated: located }),

  fetchUserLocation: async () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      set({ showLocationMarker: false });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const userCoords: Coordinates = [latitude, longitude];

      set({
        userLocation: userCoords,
        showLocationMarker: true,
        hasInitiallyLocated: true,
      });

      console.log("User location fetched:", userCoords);
    } catch (error) {
      console.warn("Error getting user location:", error instanceof Error ? error.message : String(error));
      // Don't show error to user - geolocation is optional
      // Permission denied or timeout - silently fail
      set({ showLocationMarker: false, userLocation: null });
    }
  },

  centerOnUserLocation: () => {
    const state = get();
    if (state.userLocation) {
      set({ mapCenter: state.userLocation });
    } else {
      // If no location, try to fetch it
      get().fetchUserLocation();
    }
  },
}));

// Don't auto-fetch on store creation - let the app mount first.
// Initial fetch will be triggered from AppContent useEffect.
// This ensures errors are properly handled and displayed to users.
