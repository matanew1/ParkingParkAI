import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Clock, RefreshCw, Crosshair } from "lucide-react";
import type { ParkingSpotWithStatus } from "../types/parking";
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
  Tooltip,
} from "@mui/material";

// Import the extracted components and utilities
import { getMarkerIcon } from "./utils/MarkerUtils";
import LocationMarker from "./LocationMarker";
import MapController from "./MapController";

import "leaflet/dist/leaflet.css";

interface ParkingMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
  statusError: string | null;
  mapCenter: [number, number];
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  setMapCenter: (center: [number, number]) => void;
}

const ParkingMap: React.FC<ParkingMapProps> = ({
  parkingSpots,
  loading,
  statusError,
  mapCenter,
  refreshing,
  onRefresh,
  setMapCenter,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [showLocationMarker, setShowLocationMarker] = useState(false);

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
          console.error("Error fetching location:", error.message);

          // Provide user-friendly error messages
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert(
                "Location access denied. Please allow location access in your browser settings."
              );
              break;
            case error.POSITION_UNAVAILABLE:
              alert(
                "Location information is unavailable. Please try again later."
              );
              break;
            case error.TIMEOUT:
              alert("Location request timed out. Showing default location.");
              setMapCenter([32.0853, 34.7818]); // Example: Tel Aviv coordinates
              break;
            default:
              alert(
                "Unable to fetch your location. Please enable location services."
              );
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
  const updateUserLocation = useCallback(
    (location: [number, number]) => {
      setUserLocation(location);
      if (showLocationMarker) {
        setMapCenter(location);
      }
    },
    [showLocationMarker, setMapCenter]
  );

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
    <Box position="relative" height="100%" width="100%">
      {statusError && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => onRefresh()}
              disabled={refreshing}
              startIcon={
                refreshing ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <RefreshCw size={14} />
                )
              }
            >
              Refresh
            </Button>
          }
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderRadius: 0,
          }}
        >
          {statusError}
        </Alert>
      )}

      {/* Location button */}
      <Tooltip title="Show my location">
        <Fab
          color="primary"
          size="medium"
          onClick={handleEnableLocation}
          sx={{
            position: "absolute",
            bottom: 30,
            right: 20,
            zIndex: 1000,
            "@media (max-width: 600px)": {
              bottom: 32,
              right: "10%",
              transform: "translateX(50%)",
            },
          }}
        >
          <Crosshair />
        </Fab>
      </Tooltip>

      <Box
        sx={{
          height: "100%",
          width: "100%",
          pt: statusError ? "48px" : 0,
          "& .leaflet-popup-content-wrapper": {
            padding: 0,
            overflow: "hidden",
            borderRadius: 1,
          },
          "& .leaflet-popup-content": {
            margin: 0,
            width: isMobile ? "280px !important" : "320px !important",
          },
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <MapController center={mapCenter} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {showLocationMarker && (
            <LocationMarker setUserLocation={updateUserLocation} />
          )}

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
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Chip
                            label={spot.status.InformationToShow}
                            color={
                              spot.status.InformationToShow === "מלא"
                                ? "error"
                                : "success"
                            }
                            size="small"
                          />
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Clock size={14} style={{ marginRight: 4 }} />
                            <Typography variant="caption" color="textSecondary">
                              {new Date(
                                spot.status.LastUpdateFromDambach
                              ).toLocaleTimeString()}
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
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{
                              mt: 1,
                              display: "block",
                              fontStyle: "italic",
                            }}
                          >
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
