import { create } from "zustand";
import { ParkingSpotWithStatus } from "../types/parking";
import { ParkingService } from "../services/parkingService";
import { RouteService, Coordinates } from "../services/routeService";
import { debounce } from "../utils/debounceThrottle";

export interface ParkingState {
  // Data
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;

  // Map
  mapCenter: Coordinates;
  routes: Coordinates[][];
  userLocation: Coordinates | null;
  showLocationMarker: boolean;
  selectedSpot: string | null;
  hasInitiallyLocated: boolean;

  // Actions
  fetchParkingData: (isManualRefresh?: boolean) => Promise<void>;
  fetchRoute: (start: Coordinates, end: Coordinates | string) => Promise<void>;
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
const routeService = new RouteService();

const isDevelopment = import.meta?.env?.DEV === true;

const baseUrl = isDevelopment ? "/api" : "https://gisn.tel-aviv.gov.il";
const AHUZAT_HAHOF_URL = `${baseUrl}/arcgis/rest/services/IView2/MapServer/970/query?where=1%3D1&outFields=*&f=json`;
const PRIVATE_URL = `${baseUrl}/arcgis/rest/services/IView2/MapServer/555/query?where=1%3D1&outFields=*&f=json`;

export const useParkingStore = create<ParkingState>((set, get) => ({
  // Initial state
  parkingSpots: [],
  loading: true,
  error: null,
  lastUpdated: null,
  refreshing: false,
  mapCenter: DEFAULT_COORDINATES,
  routes: [],
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

      set({
        parkingSpots: [...combinedAhuzatHahofData, ...combinedPrivateData],
        error: null,
        lastUpdated: new Date(),
      });

      console.log(
        `Successfully loaded ${
          combinedAhuzatHahofData.length + combinedPrivateData.length
        } parking spots`
      );
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

  fetchRoute: async (start: Coordinates, end: Coordinates | string) => {
    try {
      const routeData = await routeService.fetchRoute(start, end);
      console.log("Route data received:", routeData);

      if (routeData && routeData.legs && routeData.legs.length > 0) {
        const leg = routeData.legs[0];

        if (leg.coordinates && Array.isArray(leg.coordinates)) {
          console.log(
            "Setting route with coordinates array, length:",
            leg.coordinates.length
          );
          set({ routes: [leg.coordinates] });
          return {
            coordinates: leg.coordinates,
            summary: routeData.summary,
          };
        } else {
          console.error("No coordinates found in route data");
          throw new Error("Route data missing coordinates");
        }
      } else {
        console.error("Invalid route data structure:", routeData);
        throw new Error("Invalid route data structure");
      }
    } catch (error) {
      console.error("Route calculation error:", error);
      set({ routes: [] });
      throw error;
    }
  },

  handleResetMap: () => {
    set({
      mapCenter: DEFAULT_COORDINATES,
      userLocation: null,
      showLocationMarker: false,
      selectedSpot: null,
      routes: [],
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
