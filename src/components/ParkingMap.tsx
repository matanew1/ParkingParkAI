import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';
import { Car, Clock } from 'lucide-react';
import type {
  ParkingSpot,
  ParkingStatus,
  ParkingSpotWithStatus,
} from '../types/parking';
import Sidebar from './Sidebar';

import 'leaflet/dist/leaflet.css';

// Custom marker icons for different statuses
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

// Component to handle map center updates
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    32.0853, 34.7818,
  ]);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        // Add headers and configure axios for CORS
        const axiosConfig = {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        };

        const [spotsResponse, statusResponse] = await Promise.all([
          axios.get(
            'https://api.tel-aviv.gov.il/parking/stations',
            axiosConfig
          ),
          axios.get(
            'https://api.tel-aviv.gov.il/parking/StationsStatus',
            axiosConfig
          ),
        ]);

        // Validate responses
        if (!spotsResponse.data || !Array.isArray(spotsResponse.data)) {
          throw new Error('Invalid parking spots data format');
        }

        if (!statusResponse.data || !Array.isArray(statusResponse.data)) {
          throw new Error('Invalid status data format');
        }

        const statusMap = new Map(
          statusResponse.data.map((status: ParkingStatus) => [
            status.AhuzotCode,
            status,
          ])
        );

        const validSpots = spotsResponse.data
          .filter((spot: ParkingSpot) => {
            // Enhanced validation
            const lat = parseFloat(spot.GPSLattitude);
            const lng = parseFloat(spot.GPSLongitude);
            return (
              spot.GPSLattitude &&
              spot.GPSLongitude &&
              !isNaN(lat) &&
              !isNaN(lng) &&
              lat >= 31 &&
              lat <= 33 && // Valid latitude range for Tel Aviv
              lng >= 34 &&
              lng <= 35 // Valid longitude range for Tel Aviv
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching parking data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load parking data. Please try again later.'
        );
        setLoading(false);
      }
    };

    fetchParkingData();

    // Refresh status every 5 minutes
    const intervalId = setInterval(fetchParkingData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSpotClick = useCallback((spot: ParkingSpotWithStatus) => {
    setMapCenter([
      parseFloat(spot.GPSLattitude),
      parseFloat(spot.GPSLongitude),
    ]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md text-center">
          <p className="text-red-700 font-medium mb-2">Error Loading Data</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)]">
      <Sidebar spots={parkingSpots} onSpotClick={handleSpotClick} />
      <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
        <MapController center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
              <div className="p-4 min-w-[300px]">
                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  {spot.Name}
                </h3>
                <p className="text-gray-600 mb-4">{spot.Address}</p>

                <div className="space-y-4">
                  {spot.status && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        Status
                      </h4>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            spot.status.InformationToShow === 'מלא'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {spot.status.InformationToShow}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {new Date(
                            spot.status.LastUpdateFromDambach
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <Car size={18} className="mr-2" /> Capacity
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Public</p>
                        <p className="font-semibold">
                          {spot.MaximumPublicOccupancy}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Subscriber</p>
                        <p className="font-semibold">
                          {spot.MaximumSubscriberOccupancy}
                        </p>
                      </div>
                    </div>
                  </div>

                  {spot.DaytimeFee && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Fees</h4>
                      <p className="text-sm text-gray-600">{spot.DaytimeFee}</p>
                      {spot.FeeComments && (
                        <p className="text-sm text-gray-500 mt-2 italic">
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
