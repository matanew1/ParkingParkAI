import React, { useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ParkingSpotWithStatus, ParkingListProps } from "../../Types/parking";
import {
  Box,
  Typography,
  Paper,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ChevronRight, Clock, MapPin, Car, Navigation, Sparkles } from "lucide-react";
import { getStatusColor } from "../../utils/colorUtils";
import FavoriteToggleButton from "../favorites/FavoriteToggleButton";
import { motion } from "framer-motion";

// Waze Icon Component
const WazeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <img
    src="/waze-icon.svg"
    alt="Waze"
    width={size}
    height={size}
    style={{ display: "block" }}
  />
);

const VirtualizedParkingList: React.FC<ParkingListProps> = ({
  filteredSpots,
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const rowVirtualizer = useVirtualizer({
    count: filteredSpots.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 108 : 120),
    overscan: 8,
  });

  // Count available spots
  const availableCount = useMemo(
    () => filteredSpots.filter((s) => s.status_chenyon === "פנוי").length,
    [filteredSpots]
  );

  if (filteredSpots.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          px: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Car size={36} color={theme.palette.text.secondary} strokeWidth={1.5} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No parking spots found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Stats Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 0.5,
          pb: 2,
        }}
      >
        <Chip
          icon={<Sparkles size={14} />}
          label={`${filteredSpots.length} spots`}
          size="small"
          sx={{
            height: 28,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
        {availableCount > 0 && (
          <Chip
            label={`${availableCount} available`}
            size="small"
            sx={{
              height: 28,
              backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1),
              color: "success.main",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        )}
      </Box>

      {/* Virtualized List */}
      <Box
        ref={parentRef}
        sx={{
          flex: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            background: (theme) => alpha(theme.palette.text.secondary, 0.2),
            borderRadius: 2,
          },
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const spot = filteredSpots[virtualItem.index];
            return (
              <ParkingSpotCard
                key={spot.UniqueId || `${spot.code_achoza}_${spot.oid_hof}`}
                spot={spot}
                onSpotClick={onSpotClick}
                onSpotSelect={onSpotSelect}
                toggleDrawer={toggleDrawer}
                isMobile={isMobile}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                index={virtualItem.index}
              />
            );
          })}
        </div>
      </Box>
    </Box>
  );
};

// Modern Parking Spot Card
const ParkingSpotCard = React.memo<{
  spot: ParkingSpotWithStatus;
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  onSpotSelect: (spotId: string) => void;
  toggleDrawer: () => void;
  isMobile: boolean;
  style?: React.CSSProperties;
  index: number;
}>(({ spot, onSpotClick, onSpotSelect, toggleDrawer, isMobile, style, index }) => {
  const theme = useTheme();

  const handleClick = () => {
    onSpotSelect(spot.code_achoza.toString());
    onSpotClick(spot);
  };

  const handleWazeNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const url = isMobileDevice
      ? `waze://?ll=${spot.lat},${spot.lon}&navigate=yes`
      : `https://waze.com/ul?ll=${spot.lat},${spot.lon}&navigate=yes`;
    window.open(url, "_blank");
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "פנוי":
        return {
          bg: alpha(theme.palette.success.main, 0.15),
          color: theme.palette.success.main,
          icon: "🟢",
        };
      case "מעט":
        return {
          bg: alpha(theme.palette.warning.main, 0.15),
          color: theme.palette.warning.main,
          icon: "🟡",
        };
      case "מלא":
        return {
          bg: alpha(theme.palette.error.main, 0.15),
          color: theme.palette.error.main,
          icon: "🔴",
        };
      case "סגור":
        return {
          bg: alpha(theme.palette.grey[500], 0.15),
          color: theme.palette.grey[500],
          icon: "⚫",
        };
      default:
        return {
          bg: alpha(theme.palette.info.main, 0.15),
          color: theme.palette.info.main,
          icon: "🔵",
        };
    }
  };

  const statusStyles = getStatusStyles(spot.status_chenyon);

  return (
    <div style={style}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.2 }}
        style={{ padding: "0 4px 12px 4px" }}
      >
        <Paper
          elevation={0}
          onClick={handleClick}
          sx={{
            p: 2,
            cursor: "pointer",
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              borderColor: alpha(theme.palette.primary.main, 0.2),
              transform: "translateY(-2px)",
              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            {/* Status Indicator */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                backgroundColor: statusStyles.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MapPin size={20} color={statusStyles.color} />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", sm: "0.9rem" },
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    mr: 1,
                  }}
                >
                  {spot.shem_chenyon}
                </Typography>
                <ChevronRight size={16} color={theme.palette.text.secondary} />
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  mb: 1,
                  fontSize: "0.75rem",
                }}
              >
                {spot.ktovet}
              </Typography>

              {/* Bottom Row */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Chip
                  label={spot.status_chenyon || "Unknown"}
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: statusStyles.bg,
                    color: statusStyles.color,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />

                {/* Action Buttons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FavoriteToggleButton spot={spot} size="small" />
                  <Tooltip title="Navigate with Waze">
                    <IconButton
                      size="small"
                      onClick={handleWazeNavigation}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: alpha("#00D4FF", 0.1),
                        "&:hover": {
                          backgroundColor: alpha("#00D4FF", 0.2),
                        },
                      }}
                    >
                      <WazeIcon size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </div>
  );
});

ParkingSpotCard.displayName = "ParkingSpotCard";

export default VirtualizedParkingList;
