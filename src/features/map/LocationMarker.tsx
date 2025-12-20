import { useEffect, useState, useCallback, useRef } from "react";
import { Marker, Popup, useMap, Circle } from "react-leaflet";
import { Typography } from "@mui/material";
import { userLocationIcon } from "./utils/MarkerUtils";
import type { LocationMarkerProps } from "../../Types/location";
import type { Coordinates } from "../../Services/routeService";

/**
 * Component that tracks and displays the user's current location on the map
 */
const LocationMarker: React.FC<LocationMarkerProps> = ({ setUserLocation }) => {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const map = useMap();
  const hasInitiallyPositioned = useRef(false);

  const handlePositionUpdate = useCallback(
    (coords: GeolocationCoordinates) => {
      const { latitude, longitude, accuracy } = coords;
      const newPos: Coordinates = [latitude, longitude];
      setPosition(newPos);
      setAccuracy(accuracy);
      setUserLocation(newPos);
      
      // Only center the map on the first position update
      if (!hasInitiallyPositioned.current) {
        map.setView(newPos, map.getZoom());
        hasInitiallyPositioned.current = true;
      }
    },
    [setUserLocation, map]
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
        pathOptions={{ 
          color: "#00ffff", 
          fillColor: "#00ffff", 
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.7 
        }}
      />
    </>
  );
};

export default LocationMarker;
