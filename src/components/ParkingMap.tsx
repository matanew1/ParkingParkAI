// src/components/ParkingMap.tsx
import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import type {
  ParkingSpot,
  ParkingStatus,
  ParkingSpotWithStatus,
} from '../types/parking';
import Sidebar from './Sidebar';

import 'leaflet/dist/leaflet.css';

const getMarkerIcon = (status?: string) => {
  const color = status === 'מלא' ? 'red' : 'blue';
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

const ParkingMap = () => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.0853, 34.7818]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchParkingData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }
      
      const axiosConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };

      let spotsResponse;
      try {
        spotsResponse = await axios.get(
          'https://api.tel-aviv.gov.il/parking/stations',
          axiosConfig
        );
        
        if (!spotsResponse.data || !Array.isArray(spotsResponse.data)) {
          throw new Error('Invalid parking spots data format');
        }
      } catch (err) {
        throw new Error('Unable to load parking locations. Please try again later.');
      }

      let statusResponse;
      let statusMap = new Map();
      try {
        statusResponse = await axios.get(
          'https://api.tel-aviv.gov.il/parking/StationsStatus',
          axiosConfig
        );

        if (statusResponse.data && Array.isArray(statusResponse.data)) {
          statusMap = new Map(
            statusResponse.data.map((status: ParkingStatus) => [
              status.AhuzotCode,
              status,
            ])
          );
          setStatusError(null);
        } else {
          setStatusError('Status information is temporarily unavailable');
        }
      } catch (err) {
        console.error('Error fetching status data:', err);
        setStatusError('Status information is temporarily unavailable');
      }

      const validSpots = spotsResponse.data
        .filter((spot: ParkingSpot) => {
          const lat = parseFloat(spot.GPSLattitude);
          const lng = parseFloat(spot.GPSLongitude);
          return (
            spot.GPSLattitude &&
            spot.GPSLongitude &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= 31 &&
            lat <= 33 &&
            lng >= 34 &&
            lng <= 35
          );
        })
        .map((spot: ParkingSpot) => ({
          ...spot,
          status: statusMap.get(spot.AhuzotCode),
        }));

      if (validSpots.length === 0) {
        throw new Error('No valid parking spots found');
      }

      setParkingSpots(validSpots);
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

  const handleSpotClick = useCallback((spot: ParkingSpotWithStatus) => {
    setMapCenter([
      parseFloat(spot.GPSLattitude),
      parseFloat(spot.GPSLongitude),
    ]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md text-center">
          <AlertCircle className="mx-auto mb-2 text-red-600 dark:text-red-400" size={28} />
          <p className="text-red-700 dark:text-red-300 font-medium mb-2">Error Loading Data</p>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchParkingData(true);
            }}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCw size={16} className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)]">
      {statusError && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-300 mr-2" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">{statusError}</span>
          </div>
          <button
            onClick={() => fetchParkingData(true)}
            className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors flex items-center"
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw size={14} className="mr-1 animate-spin" />
            ) : (
              <RefreshCw size={14} className="mr-1" />
            )}
            Refresh
          </button>
        </div>
      )}
      
      <Sidebar 
        spots={parkingSpots} 
        onSpotClick={handleSpotClick} 
        statusError={statusError}
        lastUpdated={lastUpdated}
        onRefresh={() => fetchParkingData(true)}
        isRefreshing={refreshing}
      />
      
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        className={`h-full w-full ${statusError ? 'pt-10' : ''}`}
        zoomControl={false}
      >
        <MapController center={mapCenter} />
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.AhuzotCode}
            position={[
              parseFloat(spot.GPSLattitude),
              parseFloat(spot.GPSLongitude),
            ]}
            icon={getMarkerIcon(spot.status?.InformationToShow)}
          >
            <Popup className="custom-popup">
              <div className="p-4 min-w-[300px] bg-white dark:bg-gray-800">
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">
                  {spot.Name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{spot.Address}</p>

                <div className="space-y-4">
                  {spot.status ? (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center">
                        Status
                      </h4>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            spot.status.InformationToShow === 'מלא'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {spot.status.InformationToShow}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={14} className="mr-1" />
                          {new Date(
                            spot.status.LastUpdateFromDambach
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center">
                        <AlertCircle size={16} className="mr-2" /> Status Unavailable
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Real-time status information is temporarily unavailable
                      </p>
                    </div>
                  )}

                  {spot.DaytimeFee && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Fees</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{spot.DaytimeFee}</p>
                      {spot.FeeComments && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                          {spot.FeeComments}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ParkingMap;