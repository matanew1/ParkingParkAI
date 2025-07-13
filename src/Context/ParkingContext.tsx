import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useContext,
} from "react";
import { ParkingSpotWithStatus } from "../Types/parking";
import { ParkingService } from "../Services/parkingService";
import { RouteService, Coordinates } from "../Services/routeService";
import { ParkingContextType } from "../Types/location";

// Default coordinates for Tel Aviv
const DEFAULT_COORDINATES: Coordinates = [32.0853, 34.7818];

// Initialize services outside component to prevent re-creation on renders
const parkingService = new ParkingService();
const routeService = new RouteService();

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

type ParkingProviderProps = {
  children: ReactNode;
};

export const ParkingProvider = ({ children }: ParkingProviderProps) => {
  // Parking data states
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Map states
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [routes, setRoutes] = useState<Coordinates[][]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const fetchParkingData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }

      const combinedData = await parkingService.fetchParkingSpots();

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

  const fetchRoute = useCallback(
    async (start: Coordinates, end: Coordinates | string, options = {}) => {
      try {
        const routeData = await routeService.fetchRoute(start, end, options);
        console.log("Route data received:", routeData);

        // Extract coordinates from the route data structure
        if (routeData && routeData.legs && routeData.legs.length > 0) {
          const leg = routeData.legs[0];

          if (leg.coordinates && Array.isArray(leg.coordinates)) {
            console.log(
              "Setting route with coordinates array, length:",
              leg.coordinates.length
            );
            setRoutes([leg.coordinates]);
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
        setRoutes([]);
        throw error;
      }
    },
    [routeService]
  );

  const handleResetMap = useCallback(() => {
    setMapCenter(DEFAULT_COORDINATES);
    setUserLocation(null);
    setShowLocationMarker(false);
    setSelectedSpot(null);
    setRoutes([]);
  }, []);

  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return Promise.reject("Geolocation not supported");
    }

    return new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Coordinates = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(newLocation);
          setShowLocationMarker(true);
          resolve(newLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location permission denied. Please enable location Services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          setError(errorMessage);
          reject(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(() => fetchParkingData(), 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  useEffect(() => {
    if (userLocation && showLocationMarker) {
      setMapCenter(userLocation);
    }
  }, [userLocation, showLocationMarker]);

  useEffect(() => {
    if (showLocationMarker && !userLocation) {
      fetchUserLocation().catch((err) =>
        console.error("Failed to fetch location:", err)
      );
    }
  }, [showLocationMarker, userLocation, fetchUserLocation]);

  const value = useMemo(
    () => ({
      parkingSpots,
      loading,
      error,
      statusError: null, // No longer used with new API
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
      handleResetMap,
      fetchUserLocation,
      fetchRoute,
    }),
    [
      parkingSpots,
      loading,
      error,
      lastUpdated,
      refreshing,
      mapCenter,
      userLocation,
      showLocationMarker,
      fetchParkingData,
      selectedSpot,
      routes,
      handleResetMap,
      fetchUserLocation,
      fetchRoute,
    ]
  );

  return (
    <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>
  );
};

export const useParkingContext = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParkingContext must be used within a ParkingProvider");
  }
  return context;
};

export default ParkingContext;
