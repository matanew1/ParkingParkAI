import { Icon, divIcon } from "leaflet";
import "./MarkerUtils.css";
import { useMap } from "react-leaflet";

import React, { useEffect } from "react";
import type { ParkingSpotWithStatus } from "../../types/location"; // Adjust import path as needed
import type { Coordinates } from "../../services/routeService"; // Adjust import path as needed

// User location marker (green)
export const userLocationIcon = new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png`,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Returns a marker icon based on the parking spot status
 * @param status The status of the parking spot
 * @returns Leaflet Icon with appropriate color
 */
export const getMarkerIcon = (status?: string) => {
  const color = status === "מלא" ? "red" : "blue";
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

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

// MapZoomController for selected spot
export const MapZoomController: React.FC<{
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
export const RouteZoomController: React.FC<{ routes: Coordinates[][] }> = ({
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
