import { useState, useCallback, useContext, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import {
  Clock,
  RefreshCw,
  Crosshair,
  Trash2,
  Navigation,
  Play,
  Pause,
} from "lucide-react";
import type { ParkingMapProps } from "../../types/location";
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
  IconButton,
} from "@mui/material";
import ParkingContext from "../../Context/ParkingContext";
import {
  getMarkerIcon,
  selectedMarkerIcon,
  MapZoomController,
  RouteZoomController,
} from "./utils/MarkerUtils";
import LocationMarker from "./LocationMarker";
import MapController from "./MapController";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

// Custom icons for start and end points
const startIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const endIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const ParkingMap = ({
  parkingSpots,
  loading,
  statusError,
  mapCenter,
  refreshing,
  onRefresh,
  setMapCenter,
  selectedSpotId,
  onResetMap,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const [navigationActive, setNavigationActive] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const navigationStartTime = useRef(null);
  const lastUpdateTime = useRef(null);
  const animationFrameRef = useRef(null);
  const [processedRoutes, setProcessedRoutes] = useState([]);

  const { routes, fetchUserLocation } = useContext(ParkingContext);

  // Process routes from context
  useEffect(() => {
    if (Array.isArray(routes) && routes.length > 0) {
      // For handling the array of coordinates format
      if (
        Array.isArray(routes[0]) &&
        Array.isArray(routes[0][0]) &&
        routes[0][0].length >= 2
      ) {
        setProcessedRoutes(routes);
      }
      // For handling Valhalla API response
      else if (routes.legs && routes.summary) {
        const processed = processRouteData(routes);
        if (processed) {
          setProcessedRoutes([processed.coordinates]);
        }
      }
    }
  }, [routes]);

  const handleToggleNavigation = () => {
    if (!navigationActive) {
      // Start navigation
      setNavigationActive(true);
      navigationStartTime.current = Date.now();
      lastUpdateTime.current = Date.now();
      setDistanceTraveled(0);
      setTimeElapsed(0);
      startNavigationUpdates();
    } else {
      // Stop navigation
      setNavigationActive(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const startNavigationUpdates = () => {
    const updateNavigation = () => {
      const now = Date.now();
      const elapsed = now - lastUpdateTime.current;
      lastUpdateTime.current = now;

      setTimeElapsed((prev) => prev + elapsed / 1000);

      // Get total route length
      const totalLength = routes?.summary?.length || 0;

      // Simulated progress based on elapsed time
      if (routes?.summary?.time) {
        const progress = Math.min(
          (Date.now() - navigationStartTime.current) /
            (routes.summary.time * 1000),
          1
        );
        setDistanceTraveled(totalLength * progress);
      }

      animationFrameRef.current = requestAnimationFrame(updateNavigation);
    };

    animationFrameRef.current = requestAnimationFrame(updateNavigation);
  };

  const handleResetNavigation = () => {
    setNavigationActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setDistanceTraveled(0);
    setTimeElapsed(0);
    onResetMap();
  };

  const handleEnableLocation = () => {
    setShowLocationMarker(true);

    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      setShowLocationMarker(true);
      fetchUserLocation();
    }
  };

  const updateUserLocation = useCallback(
    (location) => {
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

  // Helper to check if we have valid route data
  const hasValidRouteData = () => {
    return (
      processedRoutes.length > 0 &&
      Array.isArray(processedRoutes[0]) &&
      processedRoutes[0].length > 1
    );
  };

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

      {/* Floating action buttons */}
      <Box
        sx={{
          position: "fixed",
          right: 20,
          top: { xs: 72, sm: 80, md: 88 },
          zIndex: 1200,
        }}
      >
        {/* Location button */}
        <Tooltip title="Show my location">
          <Fab
            color="primary"
            size="small"
            onClick={handleEnableLocation}
            sx={{
              mb: 1.5,
              mr: 2,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: theme.shadows[3],
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <Crosshair size={20} />
          </Fab>
        </Tooltip>

        {/* Reset Map Button */}
        <Tooltip title="Clear routes and reset map">
          <Fab
            color="primary"
            size="small"
            onClick={handleResetNavigation}
            sx={{
              mb: 1.5,
              mr: 2,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: theme.shadows[3],
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <Trash2 size={20} />
          </Fab>
        </Tooltip>
      </Box>

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
          <MapZoomController
            selectedSpotId={selectedSpotId}
            spots={parkingSpots}
          />
          <RouteZoomController routes={processedRoutes} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            errorTileUrl="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={3}
          />

          {showLocationMarker && (
            <LocationMarker setUserLocation={updateUserLocation} />
          )}

          {parkingSpots.map((spot) => {
            const lat = spot.lat;
            const lng = spot.lon;
            if (isNaN(lat) || isNaN(lng)) {
              console.error(
                `Invalid coordinates for spot ${spot.code_achoza}:`,
                spot
              );
              return null;
            }
            return (
              <Marker
                key={spot.code_achoza}
                position={[lat, lng]}
                icon={
                  spot.code_achoza.toString() === selectedSpotId
                    ? selectedMarkerIcon
                    : getMarkerIcon(spot.status_chenyon)
                }
              >
                <Popup>
                  <Box sx={{ p: 0 }}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {spot.Name}
                      </Typography>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        {spot.ktovet}
                      </Typography>

                      {spot.status_chenyon ? (
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
                              label={spot.status_chenyon}
                              color={
                                spot.status_chenyon === "מלא"
                                  ? "error"
                                  : "success"
                              }
                              size="small"
                            />
                            {spot.tr_status_chenyon && spot.tr_status_chenyon > 0 && (
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Clock size={14} style={{ marginRight: 4 }} />
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {new Date(spot.tr_status_chenyon).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      ) : (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <AlertTitle>Status Unavailable</AlertTitle>
                          Real-time status information is temporarily
                          unavailable
                        </Alert>
                      )}

                      {/* Parking Fees */}
                      {spot.taarif_yom && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Fees
                          </Typography>
                          <Typography variant="body2">
                            {spot.taarif_yom}
                          </Typography>
                          {spot.hearot_taarif && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{
                                mt: 1,
                                display: "block",
                                fontStyle: "italic",
                              }}
                            >
                              {spot.hearot_taarif}
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Paper>
                  </Box>
                </Popup>
              </Marker>
            );
          })}

          {/* Route Polylines */}
          {Array.isArray(routes) &&
            routes.map((route, index) => {
              // Ensure route is an array
              if (!Array.isArray(route)) {
                console.error(
                  `Route at index ${index} is not an array:`,
                  route
                );
                return null;
              }
              const validRoute = route.filter(
                ([lat, lng]) =>
                  typeof lat === "number" &&
                  typeof lng === "number" &&
                  lat >= -90 &&
                  lat <= 90 &&
                  lng >= -180 &&
                  lng <= 180
              );

              if (validRoute.length < 2) {
                console.error(
                  `Route ${index} contains invalid or insufficient coordinates:`,
                  route
                );
                return null;
              }

              return (
                <Polyline
                  key={`route-${index}`}
                  positions={validRoute}
                  pathOptions={{
                    color: "black",
                    weight: 5,
                    opacity: 0.7,
                  }}
                />
              );
            })}

          {/* Start and End Markers */}
          {routes.length > 0 && routes[0]?.length >= 2 && (
            <>
              <Marker position={routes[0][0]} icon={startIcon}>
                <Popup>
                  <Typography variant="body1">Start</Typography>
                  <Typography variant="caption" color="black">
                    Lat:{" "}
                    {typeof routes[0][0][0] === "number"
                      ? routes[0][0][0].toFixed(6)
                      : "N/A"}
                    , Lng:{" "}
                    {typeof routes[0][0][1] === "number"
                      ? routes[0][0][1].toFixed(6)
                      : "N/A"}
                  </Typography>
                </Popup>
              </Marker>

              <Marker position={routes[0][routes[0].length - 1]} icon={endIcon}>
                <Popup>
                  <Typography variant="body1">End</Typography>
                  <Typography variant="caption" color="black">
                    Lat:{" "}
                    {typeof routes[0][routes[0].length - 1][0] === "number"
                      ? routes[0][routes[0].length - 1][0].toFixed(6)
                      : "N/A"}
                    , Lng:{" "}
                    {typeof routes[0][routes[0].length - 1][1] === "number"
                      ? routes[0][routes[0].length - 1][1].toFixed(6)
                      : "N/A"}
                  </Typography>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default ParkingMap;
