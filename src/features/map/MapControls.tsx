import React from "react";
import { Box, IconButton, Tooltip, alpha } from "@mui/material";
import { RefreshCw, Navigation, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface MapControlsProps {
  onRefresh: () => void;
  onCenterUser: () => void;
  onResetMap: () => void;
  refreshing: boolean;
  showLocationMarker: boolean;
  isMobile: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onRefresh,
  onCenterUser,
  onResetMap,
  refreshing,
  showLocationMarker,
  isMobile,
}) => {
  const iconSize = isMobile ? 18 : 19;

  const controls = [
    {
      key: "refresh",
      icon: (
        <RefreshCw size={iconSize} strokeWidth={2.4} className={refreshing ? "animate-spin" : ""} />
      ),
      tooltip: "Refresh parking data",
      onClick: onRefresh,
      active: refreshing,
    },
    {
      key: "locate",
      icon: <Navigation size={iconSize} strokeWidth={2.4} />,
      tooltip: "Center on my location",
      onClick: onCenterUser,
      active: showLocationMarker,
    },
    {
      key: "reset",
      icon: <RotateCcw size={iconSize} strokeWidth={2.4} />,
      tooltip: "Reset map view",
      onClick: onResetMap,
      active: false,
    },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: 14, sm: 18 },
        right: { xs: 14, sm: 18 },
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.2, sm: 1.4 },
        // Let map gestures pass through the gaps between buttons.
        pointerEvents: "none",
      }}
    >
      {controls.map((control, index) => (
        <Box
          key={control.key}
          component={motion.div}
          style={{ pointerEvents: "auto" }}
          initial={{ opacity: 0, scale: 0.3, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          transition={{
            delay: index * 0.08,
            type: "spring",
            stiffness: 360,
            damping: 20,
          }}
        >
          <Tooltip title={control.tooltip} placement="left" arrow>
            <IconButton
              aria-label={control.tooltip}
              onClick={control.onClick}
              sx={(theme) => ({
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                borderRadius: "14px",
                color: theme.palette.primary.main,
                backgroundColor: control.active
                  ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.12)
                  : alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.06),
                backdropFilter: "blur(20px) saturate(1.2)",
                WebkitBackdropFilter: "blur(20px) saturate(1.2)",
                border: `1.4px solid ${
                  control.active
                    ? alpha(theme.palette.primary.main, 0.48)
                    : alpha(theme.palette.primary.main, 0.24)
                }`,
                boxShadow: control.active
                  ? `0 12px 32px ${alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.24 : 0.2
                    )}, 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}, inset 0 1px 2px ${alpha(
                      "#ffffff",
                      theme.palette.mode === "dark" ? 0.04 : 0.1
                    )}`
                  : `0 10px 28px ${alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.16 : 0.12
                    )}, 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}, inset 0 1px 2px ${alpha(
                      "#ffffff",
                      theme.palette.mode === "dark" ? 0.02 : 0.06
                    )}`,
                transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.28 : 0.16
                  ),
                  borderColor: alpha(theme.palette.primary.main, 0.64),
                  transform: "translateY(-2px) scale(1.06)",
                  boxShadow: `0 14px 36px ${alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.32 : 0.24
                  )}, 0 0 1px ${alpha(theme.palette.primary.main, 0.24)}`,
                },
                "&:active": {
                  transform: "scale(0.94)",
                },
              })}
            >
              {control.icon}
            </IconButton>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(MapControls);
