import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { ParkingSpotWithStatus } from "../types/parking";
import { ParkingService } from "../services/parkingService";
import { ParkingContextType } from "../types/location";
import type { Coordinates } from "../services/routeService";

// Default coordinates for Tel Aviv
const DEFAULT_COORDINATES: Coordinates = [32.0853, 34.7818];

const parkingService = new ParkingService();

const ParkingContext = createContext<ParkingContextType>();

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [routes, setRoutes] = useState([] as Coordinates[][]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  /**
   * Fetches parking data from the API
   * @param isManualRefresh Whether the refresh was manually triggered by the user
   */
  const fetchParkingData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }

      // Fetch parking spots
      const spots = await parkingService.fetchParkingSpots();

      // Fetch status data with error handling
      let statusMap = new Map();
      try {
        statusMap = await parkingService.fetchParkingStatus();
        setStatusError(null);
      } catch (err) {
        console.error("Error fetching status data:", err);
        setStatusError("Status information is temporarily unavailable");
      }

      // Combine data
      const combinedData = parkingService.combineParkingData(spots, statusMap);

      if (combinedData.length === 0) {
        throw new Error("No valid parking spots found");
      }

      setParkingSpots(combinedData);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching parking data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load parking data. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchParkingData();

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => fetchParkingData(), 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  // Fetch user location when needed
  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(newLocation);
        setShowLocationMarker(true);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Update map center when user location changes and marker is shown
  useEffect(() => {
    if (userLocation && showLocationMarker) {
      setMapCenter(userLocation);
    }
  }, [userLocation, showLocationMarker]);

  // Trigger location fetch when showLocationMarker is explicitly set to true
  useEffect(() => {
    if (showLocationMarker && !userLocation) {
      fetchUserLocation();
    }
  }, [showLocationMarker, userLocation, fetchUserLocation]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      parkingSpots,
      loading,
      error,
      statusError,
      lastUpdated,
      refreshing,
      mapCenter,
      userLocation,
      showLocationMarker,
      fetchParkingData,
      setMapCenter,
      setUserLocation,
      setShowLocationMarker,
      selectedSpot,
      setSelectedSpot,
      routes,
      setRoutes,
    }),
    [
      parkingSpots,
      loading,
      error,
      statusError,
      lastUpdated,
      refreshing,
      mapCenter,
      userLocation,
      showLocationMarker,
      fetchParkingData,
      selectedSpot,
      routes,
    ]
  );

  return (
    <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>
  );
};

export default ParkingContext;
