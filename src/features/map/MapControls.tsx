import React from "react";
import { Box, IconButton, Tooltip, alpha, Theme } from "@mui/material";
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

type Accent = "primary" | "secondary" | "neutral";

const MapControls: React.FC<MapControlsProps> = ({
  onRefresh,
  onCenterUser,
  onResetMap,
  refreshing,
  showLocationMarker,
  isMobile,
}) => {
  const iconSize = isMobile ? 19 : 20;

  // Resolve the accent color for a control from the active theme.
  const accentColor = (theme: Theme, accent: Accent): string =>
    accent === "primary"
      ? theme.palette.primary.main
      : accent === "secondary"
      ? theme.palette.secondary.main
      : theme.palette.text.primary;

  const controls = [
    {
      key: "refresh",
      icon: (
        <RefreshCw size={iconSize} className={refreshing ? "animate-spin" : ""} />
      ),
      tooltip: "Refresh parking data",
      onClick: onRefresh,
      accent: "primary" as Accent,
      active: refreshing,
    },
    {
      key: "locate",
      icon: <Navigation size={iconSize} />,
      tooltip: "Center on my location",
      onClick: onCenterUser,
      accent: "secondary" as Accent,
      active: showLocationMarker,
    },
    {
      key: "reset",
      icon: <RotateCcw size={iconSize} />,
      tooltip: "Reset map view",
      onClick: onResetMap,
      accent: "neutral" as Accent,
      active: false,
    },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: 12, sm: 16 },
        right: { xs: 12, sm: 16 },
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
          initial={{ opacity: 0, scale: 0.5, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{
            delay: index * 0.08,
            type: "spring",
            stiffness: 340,
            damping: 24,
          }}
        >
          <Tooltip title={control.tooltip} placement="left" arrow>
            <IconButton
              aria-label={control.tooltip}
              onClick={control.onClick}
              sx={{
                width: { xs: 52, sm: 56 },
                height: { xs: 52, sm: 56 },
                borderRadius: "16px",
                color: (theme) =>
                  control.active
                    ? accentColor(theme, control.accent)
                    : theme.palette.text.secondary,
                backgroundColor: (theme) =>
                  control.active
                    ? alpha(
                        accentColor(theme, control.accent),
                        theme.palette.mode === "dark" ? 0.18 : 0.11
                      )
                    : alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === "dark" ? 0.86 : 0.92
                      ),
                backdropFilter: "blur(20px) saturate(1.15)",
                WebkitBackdropFilter: "blur(20px) saturate(1.15)",
                border: (theme) =>
                  `1.5px solid ${
                    control.active
                      ? alpha(accentColor(theme, control.accent), 0.48)
                      : alpha(
                          theme.palette.divider,
                          theme.palette.mode === "dark" ? 0.38 : 0.68
                        )
                  }`,
                boxShadow: (theme) =>
                  control.active
                    ? `0 16px 40px ${alpha(
                        accentColor(theme, control.accent),
                        theme.palette.mode === "dark" ? 0.3 : 0.26
                      )}, 0 0 1px ${alpha(accentColor(theme, control.accent), 0.2)}`
                    : `0 14px 36px ${alpha(
                        theme.palette.common.black,
                        theme.palette.mode === "dark" ? 0.32 : 0.14
                      )}, 0 0 1px ${alpha(theme.palette.divider, 0.1)}`,
                transition:
                  "background-color 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
                "&:hover": {
                  color: (theme) => accentColor(theme, control.accent),
                  backgroundColor: (theme) =>
                    alpha(
                      accentColor(theme, control.accent),
                      theme.palette.mode === "dark" ? 0.26 : 0.14
                    ),
                  borderColor: (theme) =>
                    alpha(accentColor(theme, control.accent), 0.6),
                  transform: "translateY(-2px) scale(1.04)",
                  boxShadow: (theme) =>
                    `0 18px 44px ${alpha(
                      accentColor(theme, control.accent),
                      theme.palette.mode === "dark" ? 0.36 : 0.28
                    )}`,
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
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
