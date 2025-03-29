import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { MapControllerProps } from "../../Types/map";

/**
 * Component that controls the map's view center
 */
const MapController: React.FC<MapControllerProps> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);

  return null;
};

export default MapController;
