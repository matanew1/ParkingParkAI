import React, { useState, useCallback, useContext, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  Clock,
  RefreshCw,
  Crosshair,
  Trash2,
  Navigation,
  Play,
  Pause,
} from "lucide-react";
import type { ParkingMapProps } from "../../Types/location";
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
import OptimizedMarker from "./OptimizedMarker";
import { useViewportFilter } from "../../hooks/useViewportFilter";
import "leaflet/dist/leaflet.css";
import "../../styles/markerClusters.css";
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

// Performance-optimized map component that uses viewport filtering and clustering
const OptimizedParkingMapContent: React.FC<ParkingMapProps> = ({
  parkingSpots,
  loading,
  statusError,
  mapCenter,
  refreshing,
  onRefresh,
  setMapCenter,
  selectedSpotId,
  onResetMap,
  onSpotClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [userLocation, setUserLocation] = useState(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const navigationStartTime = useRef(null);
  const lastUpdateTime = useRef(null);
  const animationFrameRef = useRef(null);
  const [processedRoutes, setProcessedRoutes] = useState([]);
  const [shouldClosePopups, setShouldClosePopups] = useState(false);

  const { routes, fetchUserLocation, showLocationMarker, setShowLocationMarker } = useContext(ParkingContext);

  // Process routes from context
  useEffect(() => {
    if (Array.isArray(routes) && routes.length > 0) {
      const processed = routes.map(route => {
        if (Array.isArray(route) && route.length > 0) {
          return route.map(coord => {
            if (Array.isArray(coord) && coord.length === 2) {
              return [coord[0], coord[1]];
            }
            return null;
          }).filter(coord => coord !== null);
        }
        return [];
      }).filter(route => route.length > 0);
      
      setProcessedRoutes(processed);
    } else {
      setProcessedRoutes([]);
    }
  }, [routes]);

  const updateUserLocation = useCallback((newLocation) => {
    setUserLocation(newLocation);
  }, []);

  const handleGetUserLocation = useCallback(async () => {
    try {
      // Enable location marker
      setShowLocationMarker(true);
      const location = await fetchUserLocation();
      setMapCenter(location);
    } catch (error) {
      console.error("Error getting user location:", error);
    }
  }, [fetchUserLocation, setMapCenter, setShowLocationMarker]);

  const handlePopupsClosed = useCallback(() => {
    setShouldClosePopups(false);
  }, []);

  const resetMap = useCallback(() => {
    setShouldClosePopups(true);
    onResetMap();
  }, [onResetMap]);

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

  const hasValidRouteData = () => {
    return (
      processedRoutes.length > 0 &&
      Array.isArray(processedRoutes[0]) &&
      processedRoutes[0].length > 1
    );
  };

  return (
    <Box position="relative" height="100%" width="100%" sx={{ overflow: "hidden" }}>
      {statusError && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
            </Button>
          }
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            maxWidth: isMobile ? "calc(100% - 32px)" : "400px",
          }}
        >
          <AlertTitle>Connection Issue</AlertTitle>
          {statusError}
        </Alert>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <MapController center={mapCenter} />
        <MapZoomController
          selectedSpotId={selectedSpotId}
          spots={parkingSpots}
        />
        <RouteZoomController routes={processedRoutes} />
        <PopupController 
          shouldClosePopups={shouldClosePopups} 
          onPopupsClosed={handlePopupsClosed} 
        />
        
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

        {/* Component that handles viewport filtering and marker rendering */}
        <OptimizedMarkersLayer
          parkingSpots={parkingSpots}
          selectedSpotId={selectedSpotId}
          onSpotClick={onSpotClick}
        />

        {/* Route lines */}
        {hasValidRouteData() && processedRoutes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            positions={route}
            color="#2196F3"
            weight={4}
            opacity={0.8}
          />
        ))}

        {/* Start and end markers for routes */}
        {hasValidRouteData() && processedRoutes[0] && (
          <>
            <Marker
              position={processedRoutes[0][0]}
              icon={startIcon}
            >
              <Popup>Start Point</Popup>
            </Marker>
            <Marker
              position={processedRoutes[0][processedRoutes[0].length - 1]}
              icon={endIcon}
            >
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Floating action buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Get My Location">
          <Fab
            color="primary"
            size="small"
            onClick={handleGetUserLocation}
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            <Crosshair size={20} />
          </Fab>
        </Tooltip>
        
        <Tooltip title="Reset Map">
          <Fab
            color="secondary"
            size="small"
            onClick={resetMap}
            sx={{ bgcolor: theme.palette.secondary.main }}
          >
            <Trash2 size={20} />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Component that renders markers with viewport filtering - must be inside MapContainer
const OptimizedMarkersLayer: React.FC<{
  parkingSpots: any[];
  selectedSpotId: string | null;
  onSpotClick?: (spot: any) => void;
}> = ({ parkingSpots, selectedSpotId, onSpotClick }) => {
  const theme = useTheme();
  
  // Use viewport filtering for performance - now inside MapContainer context
  const { visibleSpots, zoomLevel, totalSpots, visibleCount } = useViewportFilter(parkingSpots, 0.1);

  // Performance monitoring
  useEffect(() => {
    console.log(`Performance: Showing ${visibleCount} of ${totalSpots} parking spots at zoom level ${zoomLevel}`);
  }, [visibleCount, totalSpots, zoomLevel]);

  // Memoize cluster options for performance
  const clusterOptions = useMemo(() => ({
    chunkedLoading: true,
    chunkInterval: 200,
    chunkDelay: 50,
    maxClusterRadius: zoomLevel > 15 ? 40 : 80,
    disableClusteringAtZoom: 17,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count > 10) size = 'medium';
      if (count > 50) size = 'large';
      
      return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="${theme.palette.primary.main}" stroke="white" stroke-width="2"/>
            <text x="20" y="25" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">${count}</text>
          </svg>
        `)}`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    },
  }), [zoomLevel, theme.palette.primary.main]);

  return (
    <>
      {/* Use clustering for better performance */}
      <MarkerClusterGroup {...clusterOptions}>
        {visibleSpots.map((spot) => (
          <OptimizedMarker
            key={spot.UniqueId || `${spot.code_achoza}_${spot.oid_hof}`}
            spot={spot}
            isSelected={spot.code_achoza.toString() === selectedSpotId}
            onSpotClick={onSpotClick}
            zoomLevel={zoomLevel}
            showDetails={zoomLevel >= 14} // Only show popup details at higher zoom levels
          />
        ))}
      </MarkerClusterGroup>
    </>
  );
};

// PopupController component
const PopupController: React.FC<{
  shouldClosePopups: boolean;
  onPopupsClosed: () => void;
}> = ({ shouldClosePopups, onPopupsClosed }) => {
  const map = useMap();

  useEffect(() => {
    if (shouldClosePopups) {
      map.closePopup();
      onPopupsClosed();
    }
  }, [shouldClosePopups, map, onPopupsClosed]);

  return null;
};

export default OptimizedParkingMapContent;
