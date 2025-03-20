// src/components/ParkingMap.tsx
import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';
import { Clock, RefreshCw } from 'lucide-react';
import type {
  ParkingSpot,
  ParkingStatus,
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
  useMediaQuery
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

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

const ParkingMap = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  if (error) {
    return (
      <Box 
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        p={4}
      >
        <Paper elevation={3} sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom fontWeight="medium">
            Error Loading Data
          </Typography>
          <Typography variant="body2" color="error" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setLoading(true);
              fetchParkingData(true);
            }}
            startIcon={<RefreshCw size={16} />}
          >
            Try Again
          </Button>
        </Paper>
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