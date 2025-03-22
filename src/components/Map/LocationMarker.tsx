import { useEffect, useState, useCallback } from "react";
import { Marker, Popup, useMap, Circle } from "react-leaflet";
import { Typography } from "@mui/material";
import { userLocationIcon } from "./utils/MarkerUtils";
import type { LocationMarkerProps } from "../../types/location";
import type { Coordinates } from "../../services/routeService";

/**
 * Component that tracks and displays the user's current location on the map
 */
const LocationMarker: React.FC<LocationMarkerProps> = ({ setUserLocation }) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const map = useMap();

  const handlePositionUpdate = useCallback(
    (coords: GeolocationCoordinates) => {
      const { latitude, longitude, accuracy } = coords;
      const newPos: Coordinates = [latitude, longitude];
      setPosition(newPos);
      setAccuracy(accuracy);
      setUserLocation(newPos);
    },
    [setUserLocation]
  );

  useEffect(() => {
    let watchId: number | null = null;

    if (navigator.geolocation) {
      // First get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => handlePositionUpdate(position.coords),
        (err) => {
          console.error("Initial location error:", err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Then watch for position changes
      watchId = navigator.geolocation.watchPosition(
        (position) => handlePositionUpdate(position.coords),
        (err) => {
          console.error("Location watch error:", err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [handlePositionUpdate]);

  // Center map on position when first obtained
  useEffect(() => {
    if (position && !position.some(isNaN)) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position === null || position.some(isNaN) ? null : (
    <>
      <Marker position={position} icon={userLocationIcon}>
        <Popup>
          <Typography variant="body1">You are here</Typography>
          <Typography variant="caption" color="textSecondary">
            Accuracy: ±{Math.round(accuracy)} meters <br />
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </Typography>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
      />
    </>
  );
};

export default LocationMarker;
