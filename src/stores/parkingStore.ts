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

// Always use /api path — proxied to gisn.tel-aviv.gov.il by both Vite dev server and vercel.json rewrites
const AHUZAT_HAHOF_URL = `/api/arcgis/rest/services/IView2/MapServer/970/query?where=1%3D1&outFields=*&f=json`;
const PRIVATE_URL = `/api/arcgis/rest/services/IView2/MapServer/555/query?where=1%3D1&outFields=*&f=json`;

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
      }

      console.log("Fetching parking data...");
      const [combinedAhuzatHahofData, combinedPrivateData] = await Promise.all([
        parkingService.fetchParkingSpots(AHUZAT_HAHOF_URL, "public"),
        parkingService.fetchParkingSpots(PRIVATE_URL, "private"),
      ]);

      if (
        combinedAhuzatHahofData.length === 0 &&
        combinedPrivateData.length === 0
      ) {
        throw new Error("No valid parking spots found");
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
      set({
        error:
          err instanceof Error
            ? err.message
            : "Failed to load parking data. Please try again later.",
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
      console.error("Geolocation is not supported by this browser.");
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
      console.error("Error getting user location:", error);
      set({ showLocationMarker: false });
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

// Auto-fetch on store creation
useParkingStore.getState().fetchParkingData();
