import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { debounce } from 'lodash';
import { Clock, RefreshCw, Crosshair } from 'lucide-react';
import { fetchParkingSpots, fetchParkingStatus } from '../services/parkingService';
import type {
  ParkingSpotWithStatus,
} from '../types/parking';
import Sidebar from './Sidebar';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip
} from '@mui/material';

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

// User location marker (green)
const userLocationIcon = new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png`,
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

// Component to handle location watching
const LocationMarker = ({ setUserLocation }: { setUserLocation: (location: [number, number]) => void }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const map = useMap();

  useEffect(() => {
    let watchId: number;

    const onLocationFound = (e: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = e.coords;
      const newPos: [number, number] = [latitude, longitude];
      setPosition(newPos);
      setAccuracy(accuracy);
      setUserLocation(newPos);
    };

    const onLocationError = (err: GeolocationPositionError) => {
      console.error('Location error:', err.message);
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        onLocationFound,
        onLocationError,
        {
          enableHighAccuracy: true,
          timeout: 20000, // 20 seconds
          maximumAge: 0, // No cache
        }
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map, setUserLocation]);

  return position === null ? null : (
    <>
      <Marker position={position} icon={userLocationIcon}>
        <Popup>
          <Typography variant="body1">You are here</Typography>
          <Typography variant="caption" color="textSecondary">
            Accuracy: ±{Math.round(accuracy)} meters
          </Typography>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
      />
    </>
  );
};

const ParkingMap = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.0853, 34.7818]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showLocationMarker, setShowLocationMarker] = useState(false);

  const fetchParkingData = useCallback(
    debounce(async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        }

        const [spots, statusMap] = await Promise.all([
          fetchParkingSpots(),
          fetchParkingStatus(),
        ]);

        const spotsWithStatus = spots.map((spot) => ({
          ...spot,
          status: statusMap.get(spot.AhuzotCode),
        }));

        setParkingSpots(spotsWithStatus);
        setLastUpdated(new Date());
        setError(null);
        setStatusError(null);
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
    }, 300), // Debounce with a 300ms delay
    []
  );

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

  const handleEnableLocation = () => {
    setShowLocationMarker(true);
  
    if (userLocation) {
      // If user location is already available, center the map on it
      setMapCenter(userLocation);
    } else {
      // Request location permission and fetch the user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error('Error fetching location:', error.message);
  
          // Provide user-friendly error messages
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert('Location access denied. Please allow location access in your browser settings.');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('Location information is unavailable. Please try again later.');
              break;
            case error.TIMEOUT:
              alert('Location request timed out. Showing default location.');
              setMapCenter([32.0853, 34.7818]); // Example: Tel Aviv coordinates
              break;
            default:
              alert('Unable to fetch your location. Please enable location services.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // 20 seconds
          maximumAge: 0, // No cache
        }
      );
    }
  };

  // Handle updating the user location
  const updateUserLocation = useCallback((location: [number, number]) => {
    setUserLocation(location);
    if (showLocationMarker) {
      setMapCenter(location);
    }
  }, [showLocationMarker]);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        sx={{ color: theme.palette.text.secondary }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading map...
        </Typography>
      </Box>
    );
  }

  return (
    <Box position="relative" height="calc(100vh - 64px)">
      {statusError && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchParkingData(true)}
              disabled={refreshing}
              startIcon={refreshing ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
            >
              Refresh
            </Button>
          }
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderRadius: 0
          }}
        >
          {statusError}
        </Alert>
      )}

      <Sidebar
        spots={parkingSpots}
        onSpotClick={handleSpotClick}
        statusError={statusError}
        lastUpdated={lastUpdated}
        onRefresh={() => fetchParkingData(true)}
        isRefreshing={refreshing}
      />

      {/* Location button */}
      <Tooltip title="Show my location">
        <Fab
          color="primary"
          size="medium"
          onClick={handleEnableLocation}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 5,
            zIndex: 1000
          }}
        >
          <Crosshair />
        </Fab>
      </Tooltip>

      <Box
        sx={{
          height: '100%',
          width: '100%',
          pt: statusError ? '48px' : 0,
          '& .leaflet-popup-content-wrapper': {
            padding: 0,
            overflow: 'hidden',
            borderRadius: 1
          },
          '& .leaflet-popup-content': {
            margin: 0,
            width: isMobile ? '280px !important' : '320px !important'
          }
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={mapCenter} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {showLocationMarker && <LocationMarker setUserLocation={updateUserLocation} />}

          {parkingSpots.map((spot) => (
            <Marker
              key={spot.AhuzotCode}
              position={[
                parseFloat(spot.GPSLattitude),
                parseFloat(spot.GPSLongitude),
              ]}
              icon={getMarkerIcon(spot.status?.InformationToShow)}
            >
              <Popup>
                <Box sx={{ p: 0 }}>
                  <Paper elevation={0} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {spot.Name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {spot.Address}
                    </Typography>

                    {spot.status ? (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Status
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={spot.status.InformationToShow}
                            color={spot.status.InformationToShow === 'מלא' ? 'error' : 'success'}
                            size="small"
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Clock size={14} style={{ marginRight: 4 }} />
                            <Typography variant="caption" color="textSecondary">
                              {new Date(spot.status.LastUpdateFromDambach).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ) : (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Status Unavailable</AlertTitle>
                        Real-time status information is temporarily unavailable
                      </Alert>
                    )}

                    {spot.DaytimeFee && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Fees
                        </Typography>
                        <Typography variant="body2">
                          {spot.DaytimeFee}
                        </Typography>
                        {spot.FeeComments && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                            {spot.FeeComments}
                          </Typography>
                        )}
                      </Paper>
                    )}
                  </Paper>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default ParkingMap;