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
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  
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

  const handleMapClick = useCallback(() => {
    setShouldClosePopups(true);
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
              {refreshing ? <CircularProgress size={12} /> : <RefreshCw size={12} />}
            </Button>
          }
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 12, md: 16 },
            left: { xs: 8, sm: 12, md: 16 },
            right: { xs: 8, sm: 12, md: 16 },
            zIndex: 1000,
            maxWidth: { xs: "calc(100% - 16px)", sm: "400px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            '& .MuiAlert-message': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          <AlertTitle sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {isSmallMobile ? "Connection Issue" : "Connection Issue"}
          </AlertTitle>
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
        <MapClickHandler onMapClick={handleMapClick} />
        
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
          bottom: { xs: 16, sm: 20, md: 24 },
          right: { xs: 16, sm: 20, md: 24 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, sm: 1.5 },
          zIndex: 1000,
        }}
      >
        <Tooltip title="Get My Location" placement="left">
          <Fab
            color="primary"
            size={isSmallMobile ? "small" : "medium"}
            onClick={handleGetUserLocation}
            sx={{ 
              bgcolor: theme.palette.primary.main,
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              minHeight: { xs: 48, sm: 56 },
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Crosshair size={isSmallMobile ? 20 : 24} />
          </Fab>
        </Tooltip>
        
        <Tooltip title="Reset Map" placement="left">
          <Fab
            color="secondary"
            size={isSmallMobile ? "small" : "medium"}
            onClick={resetMap}
            sx={{ 
              bgcolor: theme.palette.secondary.main,
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              minHeight: { xs: 48, sm: 56 },
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Trash2 size={isSmallMobile ? 20 : 24} />
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Use viewport filtering for performance - now inside MapContainer context
  const { visibleSpots, zoomLevel, totalSpots, visibleCount } = useViewportFilter(parkingSpots, 0.1);

  // Performance monitoring (reduced logging for smoother performance)
  useEffect(() => {
    // Only log significant changes to reduce console spam
    if (visibleCount > 0 && Math.abs(zoomLevel - Math.round(zoomLevel)) < 0.1) {
      console.log(`Performance: Showing ${visibleCount} of ${totalSpots} parking spots at zoom level ${Math.round(zoomLevel)}`);
    }
  }, [visibleCount, totalSpots, Math.round(zoomLevel)]);

  // Memoize cluster options for performance and smooth transitions
  const clusterOptions = useMemo(() => ({
    chunkedLoading: true,
    chunkInterval: 150, // Reduced for faster loading
    chunkDelay: 30, // Reduced delay for smoother transitions
    maxClusterRadius: zoomLevel > 15 ? (isMobile ? 25 : 35) : (isMobile ? 50 : 70), // Slightly smaller for better performance
    disableClusteringAtZoom: isMobile ? 16 : 17,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    animate: true, // Enable smooth animations
    animateAddingMarkers: false, // Disable to prevent lag during zoom
    removeOutsideVisibleBounds: true, // Remove markers outside view for better performance
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count > 10) size = 'medium';
      if (count > 50) size = 'large';
      
      const iconSize = isMobile ? 36 : 40;
      const fontSize = isMobile ? 10 : 12;
      
      return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}">
            <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize/2 - 2}" fill="${theme.palette.primary.main}" stroke="white" stroke-width="2"/>
            <text x="${iconSize/2}" y="${iconSize/2 + 4}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="white" text-anchor="middle" font-weight="bold">${count}</text>
          </svg>
        `)}`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize/2],
      });
    },
  }), [zoomLevel, theme.palette.primary.main, isMobile]);

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
            showDetails={zoomLevel >= (isMobile ? 13 : 14)} // Show popup details at lower zoom on mobile
            forceShowPopup={spot.code_achoza.toString() === selectedSpotId} // Force popup for selected spots
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

// MapClickHandler component to close popups when clicking on map
const MapClickHandler: React.FC<{
  onMapClick: () => void;
}> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = (e: any) => {
      // Only close popup if clicking on the map itself, not on markers or popups
      if (e.originalEvent && e.originalEvent.target && 
          e.originalEvent.target.tagName !== 'path' && // SVG marker paths
          !e.originalEvent.target.closest('.leaflet-marker-icon') && // Marker icons
          !e.originalEvent.target.closest('.leaflet-popup')) { // Popup content
        onMapClick();
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onMapClick]);

  return null;
};

export default OptimizedParkingMapContent;
