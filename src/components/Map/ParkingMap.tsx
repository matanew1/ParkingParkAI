import { useState, useCallback, useEffect, useContext } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import { Clock, RefreshCw, Crosshair } from "lucide-react";
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
} from "@mui/material";
import ParkingContext from "../../context/ParkingContext";
import { getMarkerIcon, selectedMarkerIcon } from "./utils/MarkerUtils";
import LocationMarker from "./LocationMarker";
import MapController from "./MapController";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

// MapZoomController for selected spot
const MapZoomController: React.FC<{
  selectedSpotId: string | null;
  spots: ParkingSpotWithStatus[];
}> = ({ selectedSpotId, spots }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedSpotId) {
      const selectedSpot = spots.find(
        (spot) => spot.AhuzotCode === selectedSpotId
      );
      if (selectedSpot) {
        const position: [number, number] = [
          parseFloat(selectedSpot.GPSLattitude),
          parseFloat(selectedSpot.GPSLongitude),
        ];
        map.setView(position, 16);
      }
    }
  }, [selectedSpotId, spots, map]);

  return null;
};

// RouteZoomController with validation
const RouteZoomController: React.FC<{ routes: Coordinates[][] }> = ({
  routes,
}) => {
  const map = useMap();

  useEffect(() => {
    if (routes.length > 0 && routes[0].length > 0) {
      const validRoutes = routes
        .map((route) =>
          route.filter(
            ([lat, lng]) =>
              typeof lat === "number" &&
              typeof lng === "number" &&
              lat >= -90 &&
              lat <= 90 &&
              lng >= -180 &&
              lng <= 180
          )
        )
        .filter((route) => route.length > 0);

      if (validRoutes.length > 0) {
        const bounds = validRoutes[0].reduce(
          (acc, [lat, lng]) => acc.extend([lat, lng]),
          new L.LatLngBounds(validRoutes[0][0], validRoutes[0][0])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        console.error("No valid route coordinates found");
        map.setView([32.0853, 34.7818], 13);
      }
    }
  }, [routes, map]);

  return null;
};

const ParkingMap: React.FC<ParkingMapProps> = ({
  parkingSpots,
  loading,
  statusError,
  mapCenter,
  refreshing,
  onRefresh,
  setMapCenter,
  selectedSpotId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const { routes } = useContext(ParkingContext);

  const handleEnableLocation = () => {
    setShowLocationMarker(true);

    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error("Error fetching location:", error.message);
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
              setMapCenter([32.0853, 34.7818]);
              break;
            default:
              alert(
                "Unable to fetch your location. Please enable location services."
              );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    }
  };

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
          <MapZoomController
            selectedSpotId={selectedSpotId}
            spots={parkingSpots}
          />
          <RouteZoomController routes={routes} />
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
            const lat = parseFloat(spot.GPSLattitude);
            const lng = parseFloat(spot.GPSLongitude);
            if (isNaN(lat) || isNaN(lng)) {
              console.error(
                `Invalid coordinates for spot ${spot.AhuzotCode}:`,
                spot
              );
              return null;
            }
            return (
              <Marker
                key={spot.AhuzotCode}
                position={[lat, lng]}
                icon={
                  spot.AhuzotCode === selectedSpotId
                    ? selectedMarkerIcon
                    : getMarkerIcon(spot.status?.InformationToShow)
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
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
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
                          Real-time status information is temporarily
                          unavailable
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
            );
          })}

          {/* Render routes with color */}
          {routes.map((route, index) => {
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
                  color: "black", // Single color for the route
                  weight: 5, // Thickness of the line
                  opacity: 0.7, // Transparency
                }}
              />
            );
          })}

          {/* Add start and end markers for the primary route */}
          {routes.length > 0 && routes[0]?.length >= 2 && (
            <>
              {/* Start Marker */}
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

              {/* End Marker */}
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
