import React from "react";
import { Box, IconButton, Tooltip, Typography, alpha, Paper } from "@mui/material";
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
  const btnSize = isMobile ? 44 : 48;
  const iconSize = isMobile ? 18 : 20;

  const controls = [
    {
      icon: <RefreshCw size={iconSize} className={refreshing ? "animate-spin" : ""} />,
      label: "Refresh",
      tooltip: "Refresh parking data",
      onClick: onRefresh,
      colorKey: "primary" as const,
      active: refreshing,
    },
    {
      icon: <Navigation size={iconSize} />,
      label: "Locate",
      tooltip: "My location",
      onClick: onCenterUser,
      colorKey: "secondary" as const,
      active: showLocationMarker,
    },
    {
      icon: <RotateCcw size={iconSize} />,
      label: "Reset",
      tooltip: "Reset view",
      onClick: onResetMap,
      colorKey: "default" as const,
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
        gap: 0,
        p: "6px",
        borderRadius: "50px",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? alpha("#0d1117", 0.88)
            : alpha("#111827", 0.82),
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: (theme) =>
          `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: (theme) =>
          `0 4px 24px ${alpha(theme.palette.common.black, 0.35)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}`,
        overflow: "hidden",
      }}
    >
      {controls.map((control, index) => (
        <motion.div
          key={control.label}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06, duration: 0.22 }}
        >
          {/* Divider between buttons (not before the first) */}
          {index > 0 && (
            <Box
              sx={{
                height: "1px",
                mx: "8px",
                backgroundColor: (theme) => alpha(theme.palette.common.white, 0.06),
              }}
            />
          )}

          <Tooltip title={control.tooltip} placement="left" arrow>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                py: "4px",
              }}
            >
              <IconButton
                onClick={control.onClick}
                disableRipple={false}
                sx={{
                  width: btnSize,
                  height: btnSize,
                  borderRadius: "50%",
                  color: control.active
                    ? control.colorKey === "primary"
                      ? "primary.main"
                      : control.colorKey === "secondary"
                      ? "secondary.main"
                      : "#ffffff"
                    : alpha("#ffffff", 0.7),
                  backgroundColor: control.active
                    ? (theme) =>
                        alpha(
                          control.colorKey === "primary"
                            ? theme.palette.primary.main
                            : control.colorKey === "secondary"
                            ? theme.palette.secondary.main
                            : theme.palette.action.selected,
                          0.18
                        )
                    : "transparent",
                  boxShadow: control.active
                    ? (theme) =>
                        `0 0 14px ${alpha(
                          control.colorKey === "primary"
                            ? theme.palette.primary.main
                            : control.colorKey === "secondary"
                            ? theme.palette.secondary.main
                            : theme.palette.common.white,
                          0.45
                        )}`
                    : "none",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(
                        control.colorKey === "primary"
                          ? theme.palette.primary.main
                          : control.colorKey === "secondary"
                          ? theme.palette.secondary.main
                          : theme.palette.common.white,
                        0.18
                      ),
                    color:
                      control.colorKey === "primary"
                        ? "primary.main"
                        : control.colorKey === "secondary"
                        ? "secondary.main"
                        : "#ffffff",
                    boxShadow: (theme) =>
                      `0 0 16px ${alpha(
                        control.colorKey === "primary"
                          ? theme.palette.primary.main
                          : control.colorKey === "secondary"
                          ? theme.palette.secondary.main
                          : theme.palette.common.white,
                        0.5
                      )}`,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {control.icon}
              </IconButton>
              <Typography
                sx={{
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: control.active
                    ? control.colorKey === "primary"
                      ? "primary.main"
                      : control.colorKey === "secondary"
                      ? "secondary.main"
                      : alpha("#ffffff", 0.9)
                    : alpha("#ffffff", 0.45),
                  lineHeight: 1,
                  userSelect: "none",
                  transition: "color 0.2s ease",
                }}
              >
                {control.label}
              </Typography>
            </Box>
          </Tooltip>
        </motion.div>
      ))}
    </Paper>
  );
};

export default React.memo(MapControls);
