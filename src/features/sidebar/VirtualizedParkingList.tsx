import React from "react";
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
  Skeleton,
} from "@mui/material";
import { ChevronRight, MapPin, Car } from "lucide-react";
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

const SkeletonCard: React.FC = () => {
  const theme = useTheme();
  return (
    <Box sx={{ px: "4px", pb: "12px" }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "10px",
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.72),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "10px", flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="90%" height={16} sx={{ mb: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 1 }} />
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

const VirtualizedParkingList: React.FC<ParkingListProps> = ({
  filteredSpots,
  onSpotClick,
  onSpotSelect,
  isMobile,
  loading = false,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const rowVirtualizer = useVirtualizer({
    count: filteredSpots.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 96 : 108),
    overscan: 8,
  });

  if (loading) {
    return (
      <Box sx={{ overflow: "hidden" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </Box>
    );
  }

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
  style?: React.CSSProperties;
  index: number;
}>(({ spot, onSpotClick, onSpotSelect, style, index }) => {
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
        };
      case "מעט":
        return {
          bg: alpha(theme.palette.warning.main, 0.15),
          color: theme.palette.warning.main,
        };
      case "מלא":
        return {
          bg: alpha(theme.palette.error.main, 0.15),
          color: theme.palette.error.main,
        };
      case "סגור":
        return {
          bg: alpha(theme.palette.grey[500], 0.15),
          color: theme.palette.grey[500],
        };
      default:
        return {
          bg: alpha(theme.palette.info.main, 0.15),
          color: theme.palette.info.main,
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
        style={{ padding: "0 4px 8px 4px" }}
      >
        <Paper
          elevation={0}
          onClick={handleClick}
          sx={{
            p: 1.35,
            cursor: "pointer",
            borderRadius: "10px",
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            backgroundColor: alpha(
              theme.palette.background.paper,
              theme.palette.mode === "dark" ? 0.72 : 0.86
            ),
            backdropFilter: "blur(12px)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.86 : 1),
              borderColor: alpha(theme.palette.primary.main, 0.28),
              transform: "translateY(-2px)",
              boxShadow: `0 14px 34px ${alpha(
                theme.palette.common.black,
                theme.palette.mode === "dark" ? 0.26 : 0.1
              )}`,
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.15 }}>
            {/* Status Indicator */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor: statusStyles.bg,
                border: `1px solid ${alpha(statusStyles.color, 0.18)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MapPin size={18} color={statusStyles.color} />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.35 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 750,
                    fontSize: { xs: "0.84rem", sm: "0.88rem" },
                    color: "text.primary",
                    letterSpacing: 0,
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
                  mb: 0.75,
                  fontSize: "0.72rem",
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
                    height: 22,
                    backgroundColor: statusStyles.bg,
                    color: statusStyles.color,
                    border: `1px solid ${alpha(statusStyles.color, 0.16)}`,
                    fontWeight: 750,
                    fontSize: "0.68rem",
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
                        width: 30,
                        height: 30,
                        borderRadius: "10px",
                        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.26 : 0.16),
                        },
                      }}
                    >
                      <WazeIcon size={15} />
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
