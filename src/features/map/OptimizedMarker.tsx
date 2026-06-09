import React, { memo, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import {
  Box,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
  Button,
  alpha,
} from "@mui/material";
import { Clock, MapPin, Navigation, DollarSign } from "lucide-react";
import { ParkingSpotWithStatus } from "../../Types/parking";
import { getMarkerIcon, selectedMarkerIcon } from "./utils/MarkerUtils";
import { useAutoPopup } from "../../hooks/useAutoPopup";
import FavoriteToggleButton from "../favorites/FavoriteToggleButton";

// Waze Icon Component
const WazeIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <img
    src="/waze-icon.svg"
    alt="Waze"
    width={size}
    height={size}
    style={{ display: "block" }}
  />
);

interface OptimizedMarkerProps {
  spot: ParkingSpotWithStatus;
  isSelected: boolean;
  onSpotClick?: (spot: ParkingSpotWithStatus) => void;
  showDetails: boolean;
  forceShowPopup?: boolean;
}

const OptimizedMarker = memo<OptimizedMarkerProps>(
  ({ spot, isSelected, onSpotClick, showDetails, forceShowPopup = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const markerRef = useRef<any>(null);
    const lat = spot.lat;
    const lng = spot.lon;

    const handleWazeNavigation = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const url = isMobileDevice
        ? `waze://?ll=${lat},${lng}&navigate=yes`
        : `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      window.open(url, "_blank");
    };

    const handleGoogleMaps = () => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    };

    useAutoPopup(
      lat,
      lng,
      isSelected,
      showDetails || forceShowPopup,
      spot.shem_chenyon || "Parking Spot"
    );

    if (isNaN(lat) || isNaN(lng)) return null;

    const getStatusStyles = (status: string) => {
      switch (status?.toLowerCase()) {
        case "פנוי":
          return { bg: theme.palette.success.main, label: "Available" };
        case "מעט":
          return { bg: theme.palette.warning.main, label: "Limited" };
        case "מלא":
          return { bg: theme.palette.error.main, label: "Full" };
        case "סגור":
          return { bg: theme.palette.grey[500], label: "Closed" };
        default:
          return { bg: theme.palette.info.main, label: status || "Unknown" };
      }
    };

    const statusStyles = getStatusStyles(spot.status_chenyon);

    return (
      <Marker
        ref={markerRef}
        position={[lat, lng]}
        icon={isSelected ? selectedMarkerIcon : getMarkerIcon(spot.status_chenyon)}
        eventHandlers={{
          click: () => onSpotClick?.(spot),
        }}
      >
        {(showDetails || forceShowPopup) && (
          <Popup
            closeOnClick={false}
            autoClose={false}
            keepInView={true}
            closeButton={true}
            autoPan={isMobile}
            maxWidth={isMobile ? 300 : 320}
            minWidth={isMobile ? 280 : 280}
          >
            <Box sx={{ p: 0 }}>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  pb: 1.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      backgroundColor: alpha(statusStyles.bg, theme.palette.mode === "dark" ? 0.18 : 0.12),
                      border: `1px solid ${alpha(statusStyles.bg, 0.18)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} color={statusStyles.bg} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        lineHeight: 1.3,
                        color: theme.palette.text.primary,
                        letterSpacing: 0,
                        mb: 0.25,
                      }}
                    >
                      {spot.shem_chenyon || "Parking Spot"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.75rem",
                        display: "block",
                      }}
                    >
                      {spot.ktovet}
                    </Typography>
                  </Box>
                  <FavoriteToggleButton spot={spot} size="small" />
                </Box>
              </Box>

              {/* Status */}
              <Box sx={{ p: 2, py: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Chip
                    label={spot.status_chenyon || "Unknown"}
                    size="small"
                    sx={{
                      height: 26,
                      backgroundColor: alpha(statusStyles.bg, theme.palette.mode === "dark" ? 0.18 : 0.12),
                      color: statusStyles.bg,
                      border: `1px solid ${alpha(statusStyles.bg, 0.18)}`,
                      fontWeight: 750,
                      fontSize: "0.75rem",
                    }}
                  />
                  {spot.tr_status_chenyon && spot.tr_status_chenyon > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
                      <Clock size={12} color={theme.palette.text.secondary} />
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem" }}
                      >
                        {new Date(spot.tr_status_chenyon).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Pricing Info */}
                {spot.taarif_yom && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      backgroundColor: alpha(
                        theme.palette.background.default,
                        theme.palette.mode === "dark" ? 0.42 : 0.72
                      ),
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                      <DollarSign size={14} color={theme.palette.text.secondary} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: "0.75rem" }}
                      >
                        Pricing
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary }}
                    >
                      {spot.taarif_yom}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Navigation Buttons */}
              <Box
                sx={{
                  p: 2,
                  pt: 0,
                  display: "flex",
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<WazeIcon size={20} />}
                  onClick={handleWazeNavigation}
                  sx={{
                    py: 1.25,
                    borderRadius: "10px",
                    fontWeight: 750,
                    fontSize: "0.85rem",
                    textTransform: "none",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.26)}`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                      boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.32)}`,
                    },
                  }}
                >
                  Waze
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Navigation size={18} />}
                  onClick={handleGoogleMaps}
                  sx={{
                    py: 1.25,
                    borderRadius: "10px",
                    fontWeight: 750,
                    fontSize: "0.85rem",
                    textTransform: "none",
                    borderColor: alpha(theme.palette.primary.main, 0.24),
                  }}
                >
                  Maps
                </Button>
              </Box>
            </Box>
          </Popup>
        )}
      </Marker>
    );
  }
);

OptimizedMarker.displayName = "OptimizedMarker";

export default OptimizedMarker;
