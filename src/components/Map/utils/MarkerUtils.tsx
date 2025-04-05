import { Icon, divIcon } from "leaflet";
import "./MarkerUtils.css";
import { useMap } from "react-leaflet";
import React, { useEffect, useCallback, useMemo } from "react";
import type { ParkingSpotWithStatus } from "../../Types/parking";
import type { Coordinates } from "../../Services/routeService";

// Constants
const ICON_SIZE = [25, 41];
const ICON_ANCHOR = [12, 41];
const POPUP_ANCHOR = [1, -34];
const SHADOW_SIZE = [41, 41];
const SHADOW_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

// Cache for marker icons to prevent recreating them
const iconCache = new Map<string, Icon>();

// User location marker (green)
export const userLocationIcon = new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png`,
  shadowUrl: SHADOW_URL,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

/**
 * Returns a marker icon based on the parking spot status
 * Uses caching to improve performance
 * @param status The status of the parking spot
 * @returns Leaflet Icon with appropriate color
 */
export const getMarkerIcon = (status?: string) => {
  const color = status === "מלא" ? "red" : "blue";
  const cacheKey = `marker-${color}`;

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  const icon = new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: SHADOW_URL,
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
    shadowSize: SHADOW_SIZE,
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

// Selected marker with glow effect
export const selectedMarkerIcon = divIcon({
  className: "selected-marker-icon",
  html: `
    <div style="
      position: relative;
      width: 35px;
      height: 55px;
    ">
      <img 
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" 
        style="width: 100%; height: 100%;"
      />
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.8);
        animation: glow 1.5s infinite;
      "></div>
    </div>
  `,
  iconSize: [30, 50], // Larger size for emphasis
  iconAnchor: [17, 55],
  popupAnchor: [1, -34],
});

// Start and end icons for routes
export const routeIcons = {
  start: new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
    shadowUrl: SHADOW_URL,
    shadowSize: SHADOW_SIZE,
  }),
  end: new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: ICON_SIZE,
    iconAnchor: ICON_ANCHOR,
    popupAnchor: POPUP_ANCHOR,
    shadowUrl: SHADOW_URL,
    shadowSize: SHADOW_SIZE,
  }),
};

/**
 * MapZoomController for selected spot
 * Zooms map to the selected parking spot
 */
export const MapZoomController: React.FC<{
  selectedSpotId: string | null;
  spots: ParkingSpotWithStatus[];
}> = ({ selectedSpotId, spots }) => {
  const map = useMap();

  // Memoize the selected spot to prevent unnecessary processing
  const selectedSpot = useMemo(() => {
    if (!selectedSpotId) return null;
    return spots.find((spot) => spot.AhuzotCode === selectedSpotId);
  }, [selectedSpotId, spots]);

  useEffect(() => {
    if (selectedSpot) {
      const position: Coordinates = [
        parseFloat(selectedSpot.GPSLattitude),
        parseFloat(selectedSpot.GPSLongitude),
      ];

      if (!isNaN(position[0]) && !isNaN(position[1])) {
        map.setView(position, 16);
      }
    }
  }, [selectedSpot, map]);

  return null;
};

/**
 * Validates coordinates to ensure they are usable
 */
const isValidCoordinate = (coord: Coordinates): boolean => {
  return (
    typeof coord[0] === "number" &&
    typeof coord[1] === "number" &&
    !isNaN(coord[0]) &&
    !isNaN(coord[1]) &&
    coord[0] >= -90 &&
    coord[0] <= 90 &&
    coord[1] >= -180 &&
    coord[1] <= 180
  );
};

/**
 * RouteZoomController with validation
 * Fits map bounds to show the entire route
 */
export const RouteZoomController: React.FC<{
  routes: Coordinates[][];
}> = ({ routes }) => {
  const map = useMap();

  const getValidRoutes = useCallback((inputRoutes: Coordinates[][]) => {
    return inputRoutes
      .map((route) => route.filter(isValidCoordinate))
      .filter((route) => route.length > 0);
  }, []);

  useEffect(() => {
    if (routes.length === 0 || !routes[0]?.length) return;

    const validRoutes = getValidRoutes(routes);

    if (validRoutes.length > 0 && validRoutes[0].length > 0) {
      try {
        const bounds = validRoutes[0].reduce(
          (acc, coord) => acc.extend([coord[0], coord[1]]),
          new L.LatLngBounds(
            [validRoutes[0][0][0], validRoutes[0][0][1]],
            [validRoutes[0][0][0], validRoutes[0][0][1]]
          )
        );

        // Add some padding around the route
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (err) {
        console.error("Error fitting bounds:", err);
      }
    }
  }, [routes, map, getValidRoutes]);

  return null;
};
/**
 * MarkerUtils module for managing markers on the map
 * Provides functions to create and manage marker icons
 */