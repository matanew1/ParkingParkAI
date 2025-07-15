import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { MapControllerProps } from "../../Types/map";

/**
 * Component that controls the map's view center
 */
const MapController: React.FC<MapControllerProps> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    // Use flyTo instead of setView for smoother transitions
    // that are less likely to close popups
    map.flyTo(center, 15, {
      animate: true,
      duration: 1.0
    });
  }, [center, map]);

  return null;
};

export default MapController;
