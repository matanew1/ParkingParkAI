import React, { useState, useCallback, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { RefreshCw } from "lucide-react";
import type { ParkingMapProps } from "../../Types/location";
import type { ParkingSpotWithStatus } from "../../Types/parking";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParkingStore } from "../../stores/parkingStore";
import { useThemeStore } from "../../stores/themeStore";
import { MapZoomController } from "./utils/MarkerUtils";
import LocationMarker from "./LocationMarker";
import MapController from "./MapController";
import OptimizedMarker from "./OptimizedMarker";
import MapControls from "./MapControls";
import { useViewportFilter } from "../../hooks/useViewportFilter";
import "leaflet/dist/leaflet.css";
import "../../styles/markerClusters.css";
import { Icon } from "leaflet";

// LocationMarker bubbles its position up via this callback, but the map itself
// doesn't need it (the store owns user location), so we hand it a no-op.
const noop = () => {};

// Performance-optimized map: viewport filtering + marker clustering.
const OptimizedParkingMapContent: React.FC<ParkingMapProps> = ({
  parkingSpots,
  loading,
  statusError,
  mapCenter,
  refreshing,
  onRefresh,
  selectedSpotId,
  onResetMap,
  onSpotClick,
}) => {
  const theme = useTheme();
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const { isDarkMode } = useThemeStore();

  const [shouldClosePopups, setShouldClosePopups] = useState(false);

  const { showLocationMarker, setShowLocationMarker, centerOnUserLocation } =
    useParkingStore();

  const handleGetUserLocation = useCallback(() => {
    setShowLocationMarker(true);
    centerOnUserLocation();
  }, [setShowLocationMarker, centerOnUserLocation]);

  const handlePopupsClosed = useCallback(() => setShouldClosePopups(false), []);
  const handleMapClick = useCallback(() => setShouldClosePopups(true), []);
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

  // If there's an error and no parking spots loaded yet, show error state
  if (statusError && parkingSpots.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        flexDirection="column"
        gap={2}
        sx={{ p: 3, color: theme.palette.text.secondary }}
      >
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          Unable to Load Map
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center", maxWidth: "80%" }}>
          {statusError}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onRefresh}
          disabled={refreshing}
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshCw size={20} />}
        >
          Retry
        </Button>
      </Box>
    );
  }

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
            // Leave room for the floating map controls on the right.
            right: { xs: 70, sm: 80 },
            zIndex: 1000,
            maxWidth: { sm: "400px" },
            "& .MuiAlert-message": {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          }}
        >
          <AlertTitle sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Connection Issue
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
        <MapZoomController selectedSpotId={selectedSpotId} spots={parkingSpots} />
        <PopupController
          shouldClosePopups={shouldClosePopups}
          onPopupsClosed={handlePopupsClosed}
        />
        <MapClickHandler onMapClick={handleMapClick} />

        <TileLayer
          attribution='© <a href="https://carto.com/attributions">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            isDarkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          subdomains="abcd"
          maxZoom={20}
          minZoom={3}
        />

        {showLocationMarker && <LocationMarker setUserLocation={noop} />}

        <OptimizedMarkersLayer
          parkingSpots={parkingSpots}
          selectedSpotId={selectedSpotId}
          onSpotClick={onSpotClick}
        />
      </MapContainer>

      <MapControls
        onRefresh={onRefresh}
        onCenterUser={handleGetUserLocation}
        onResetMap={resetMap}
        refreshing={refreshing}
        showLocationMarker={showLocationMarker}
        isMobile={isSmallMobile}
      />
    </Box>
  );
};

// Renders markers with viewport filtering + clustering. Must live inside MapContainer.
const OptimizedMarkersLayer: React.FC<{
  parkingSpots: ParkingSpotWithStatus[];
  selectedSpotId: string | null;
  onSpotClick?: (spot: ParkingSpotWithStatus) => void;
}> = ({ parkingSpots, selectedSpotId, onSpotClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { visibleSpots, zoomLevel } = useViewportFilter(parkingSpots, 0.1);

  const clusterOptions = useMemo(
    () => ({
      chunkedLoading: true,
      chunkInterval: 150,
      chunkDelay: 30,
      maxClusterRadius:
        zoomLevel > 15 ? (isMobile ? 25 : 35) : isMobile ? 50 : 70,
      disableClusteringAtZoom: isMobile ? 16 : 17,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      animate: true,
      animateAddingMarkers: false,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: (cluster: { getChildCount: () => number }) => {
        const count = cluster.getChildCount();
        const iconSize = isMobile ? 36 : 40;
        const fontSize = isMobile ? 10 : 12;
        const ringColor = theme.palette.mode === "dark" ? "#111315" : "#FFFFFF";
        const primary = theme.palette.primary.main;
        const secondary = theme.palette.secondary.main;

        return new Icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}">
            <defs>
              <linearGradient id="clusterGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${primary}"/>
                <stop offset="100%" stop-color="${secondary}"/>
              </linearGradient>
              <filter id="clusterShadow" x="-35%" y="-35%" width="170%" height="170%">
                <feDropShadow dx="0" dy="7" stdDeviation="4" flood-color="${primary}" flood-opacity="0.28"/>
              </filter>
            </defs>
            <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 2 - 1}" fill="${primary}" opacity="0.16"/>
            <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${
            iconSize / 2 - 5
          }" fill="url(#clusterGradient)" stroke="${ringColor}" stroke-width="2.5" filter="url(#clusterShadow)"/>
            <text x="${iconSize / 2}" y="${
            iconSize / 2 + 4
          }" font-family="Arial, sans-serif" font-size="${fontSize}" fill="white" text-anchor="middle" font-weight="800">${count}</text>
          </svg>
        `)}`,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2],
        });
      },
    }),
    [
      zoomLevel,
      theme.palette.mode,
      theme.palette.primary.main,
      theme.palette.secondary.main,
      isMobile,
    ]
  );

  return (
    <MarkerClusterGroup {...clusterOptions}>
      {visibleSpots.map((spot) => (
        <OptimizedMarker
          key={spot.UniqueId || `${spot.code_achoza}_${spot.oid_hof}`}
          spot={spot}
          isSelected={spot.code_achoza.toString() === selectedSpotId}
          onSpotClick={onSpotClick}
          showDetails={zoomLevel >= (isMobile ? 13 : 14)}
          forceShowPopup={spot.code_achoza.toString() === selectedSpotId}
        />
      ))}
    </MarkerClusterGroup>
  );
};

// Closes any open popup when asked (e.g. after a map click or reset).
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

// Closes popups when clicking the map background (not markers/popups).
const MapClickHandler: React.FC<{ onMapClick: () => void }> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: { originalEvent?: MouseEvent }) => {
      const target = e.originalEvent?.target as HTMLElement | undefined;
      if (
        target &&
        target.tagName !== "path" &&
        !target.closest(".leaflet-marker-icon") &&
        !target.closest(".leaflet-popup")
      ) {
        onMapClick();
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

export default OptimizedParkingMapContent;
