import { useEffect, useState } from "react";
import { Marker, Popup, useMap, Circle } from "react-leaflet";
import { Typography } from "@mui/material";
import { userLocationIcon } from "./utils/MarkerUtils";

interface LocationMarkerProps {
  setUserLocation: (location: [number, number]) => void;
}

/**
 * Component that tracks and displays the user's current location on the map
 */
const LocationMarker: React.FC<LocationMarkerProps> = ({ setUserLocation }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const map = useMap();

  useEffect(() => {
    let watchId: number;

    const onLocationFound = (e: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = e.coords;
      const newPos: [number, number] = [latitude, longitude];
      setPosition(newPos);
      setAccuracy(accuracy);
      setUserLocation(newPos);
    };

    const onLocationError = (err: GeolocationPositionError) => {
      console.error("Location error:", err.message);
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        onLocationFound,
        onLocationError,
        {
          enableHighAccuracy: true,
          timeout: 20000, // 20 seconds
          maximumAge: 0, // No cache
        }
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map, setUserLocation]);

  return position === null ? null : (
    <>
      <Marker position={position} icon={userLocationIcon}>
        <Popup>
          <Typography variant="body1">You are here</Typography>
          <Typography variant="caption" color="textSecondary">
            Accuracy: ±{Math.round(accuracy)} meters
          </Typography>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.1 }}
      />
    </>
  );
};

export default LocationMarker;
