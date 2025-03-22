import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ParkingSpotWithStatus } from "../types/parking";
import { ParkingService } from "../services/parkingService";
import { ParkingContextType } from "../types/location";

const parkingService = new ParkingService();

const ParkingContext = createContext<ParkingContextType>({
  parkingSpots: [],
  loading: true,
  error: null,
  statusError: null,
  lastUpdated: null,
  refreshing: false,
  mapCenter: [32.0853, 34.7818],
  userLocation: null,
  showLocationMarker: false,
  fetchParkingData: async () => {},
  setMapCenter: () => {},
  setUserLocation: () => {},
  setShowLocationMarker: () => {},
  selectedSpot: null,
  setSelectedSpot: () => {},
  routes: [],
  setRoutes: () => {},
});

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    32.0853, 34.7818,
  ]);
  const [routes, setRoutes] = useState<[number, number][][]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const fetchParkingData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }

      const spots = await parkingService.fetchParkingSpots();
      let statusMap = new Map();
      try {
        statusMap = await parkingService.fetchParkingStatus();
        setStatusError(null);
      } catch (err) {
        console.error("Error fetching status data:", err);
        setStatusError("Status information is temporarily unavailable");
      }

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
    const intervalId = setInterval(() => fetchParkingData(), 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  // Function to fetch user location
  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    console.log("Attempting to fetch user location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(newLocation);
        setShowLocationMarker(true);
        console.log("Location fetched successfully:", newLocation);
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
        setUserLocation(null);
        setShowLocationMarker(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation && showLocationMarker) {
      setMapCenter(userLocation);
      console.log("Map center updated to:", userLocation);
      console.log("Selected spot:", selectedSpot);
      console.log("Show routes:", routes);
    }
  }, [userLocation, showLocationMarker, selectedSpot, routes, setMapCenter]);

  // Trigger location fetch when showLocationMarker is explicitly set to true
  useEffect(() => {
    if (!userLocation) {
      fetchUserLocation();
    }
  }, [fetchUserLocation, userLocation]);

  const value = {
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
  };

  return (
    <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>
  );
};

export default ParkingContext;
