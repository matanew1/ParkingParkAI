// src/context/ParkingContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ParkingSpotWithStatus } from '../types/parking';
import { fetchParkingSpots, fetchParkingStatus, combineParkingData } from '../services/parkingService';

interface ParkingContextType {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  error: string | null;
  statusError: string | null;
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
});

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.0853, 34.7818]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const fetchParkingData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }
      
      // Fetch parking spots
      const spots = await fetchParkingSpots();
      
      // Fetch parking status
      let statusMap = new Map();
      try {
        statusMap = await fetchParkingStatus();
        setStatusError(null);
      } catch (err) {
        console.error('Error fetching status data:', err);
        setStatusError('Status information is temporarily unavailable');
      }

      // Combine the data
      const combinedData = combineParkingData(spots, statusMap);
      
      if (combinedData.length === 0) {
        throw new Error('No valid parking spots found');
      }

      setParkingSpots(combinedData);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching parking data:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load parking data. Please try again later.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(() => fetchParkingData(), 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  // Effects for user location
  useEffect(() => {
    if (userLocation && showLocationMarker) {
      setMapCenter(userLocation);
    }
  }, [userLocation, showLocationMarker]);

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
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
};

export const useParking = () => useContext(ParkingContext);