import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useMediaQuery, useTheme } from "@mui/material";
import type { MapControllerProps } from "../../Types/map";

/**
 * Component that controls the map's view center
 */
const MapController: React.FC<MapControllerProps> = ({ center }) => {
  const map = useMap();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Use different zoom levels and animation duration for mobile
    const zoomLevel = isMobile ? 14 : 15;
    const duration = isMobile ? 0.8 : 1.0;
    
    map.flyTo(center, zoomLevel, {
      animate: true,
      duration: duration
    });
  }, [center, map, isMobile]);

  return null;
};

export default MapController;
