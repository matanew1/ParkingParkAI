import React from "react";
import { Box, IconButton, Tooltip, alpha, Paper } from "@mui/material";
import { RefreshCw, Navigation, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
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
  const controls = [
    {
      icon: <RefreshCw size={isMobile ? 18 : 20} className={refreshing ? "animate-spin" : ""} />,
      label: "Refresh parking data",
      onClick: onRefresh,
      color: "primary" as const,
      active: refreshing,
    },
    {
      icon: <Navigation size={isMobile ? 18 : 20} />,
      label: "My location",
      onClick: onCenterUser,
      color: "secondary" as const,
      active: showLocationMarker,
    },
    {
      icon: <RotateCcw size={isMobile ? 18 : 20} />,
      label: "Reset view",
      onClick: onResetMap,
      color: "default" as const,
      active: false,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        top: { xs: 12, sm: 16 },
        right: { xs: 12, sm: 16 },
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        p: 0.75,
        borderRadius: 3,
        backgroundColor: (theme) =>
          alpha(theme.palette.background.paper, 0.9),
        backdropFilter: "blur(12px)",
        border: (theme) =>
          `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: (theme) =>
          `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
      }}
    >
      {controls.map((control, index) => (
        <motion.div
          key={control.label}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <Tooltip title={control.label} placement="left" arrow>
            <IconButton
              onClick={control.onClick}
              size={isMobile ? "small" : "medium"}
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                borderRadius: 2.5,
                color: control.active
                  ? control.color === "primary"
                    ? "primary.main"
                    : control.color === "secondary"
                    ? "secondary.main"
                    : "text.primary"
                  : "text.secondary",
                backgroundColor: control.active
                  ? (theme) =>
                      alpha(
                        control.color === "primary"
                          ? theme.palette.primary.main
                          : control.color === "secondary"
                          ? theme.palette.secondary.main
                          : theme.palette.action.selected,
                        0.15
                      )
                  : "transparent",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(
                      control.color === "primary"
                        ? theme.palette.primary.main
                        : control.color === "secondary"
                        ? theme.palette.secondary.main
                        : theme.palette.action.hover,
                      0.2
                    ),
                  color:
                    control.color === "primary"
                      ? "primary.main"
                      : control.color === "secondary"
                      ? "secondary.main"
                      : "text.primary",
                },
                transition: "all 0.2s ease",
              }}
            >
              {control.icon}
            </IconButton>
          </Tooltip>
        </motion.div>
      ))}
    </Paper>
  );
};

export default React.memo(MapControls);
