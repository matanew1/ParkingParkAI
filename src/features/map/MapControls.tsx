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
        top: { xs: 10, sm: 16 },
        right: { xs: 10, sm: 16 },
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, sm: 1.25 },
        // Let map gestures pass through the gaps between buttons.
        pointerEvents: "none",
      }}
    >
      {controls.map((control, index) => (
        <Box
          key={control.key}
          component={motion.div}
          style={{ pointerEvents: "auto" }}
          initial={{ opacity: 0, scale: 0.6, x: 12 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            delay: index * 0.06,
            type: "spring",
            stiffness: 320,
            damping: 22,
          }}
        >
          <Tooltip title={control.tooltip} placement="left" arrow>
            <IconButton
              aria-label={control.tooltip}
              onClick={control.onClick}
              sx={{
                width: { xs: 48, sm: 50 },
                height: { xs: 48, sm: 50 },
                borderRadius: "14px",
                color: (theme) =>
                  control.active
                    ? accentColor(theme, control.accent)
                    : theme.palette.text.secondary,
                backgroundColor: (theme) =>
                  control.active
                    ? alpha(
                        accentColor(theme, control.accent),
                        theme.palette.mode === "dark" ? 0.2 : 0.12
                      )
                    : alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === "dark" ? 0.88 : 0.94
                      ),
                backdropFilter: "blur(18px) saturate(1.12)",
                WebkitBackdropFilter: "blur(18px) saturate(1.12)",
                border: (theme) =>
                  `1px solid ${
                    control.active
                      ? alpha(accentColor(theme, control.accent), 0.5)
                      : alpha(
                          theme.palette.divider,
                          theme.palette.mode === "dark" ? 0.42 : 0.72
                        )
                  }`,
                boxShadow: (theme) =>
                  control.active
                    ? `0 14px 34px ${alpha(
                        accentColor(theme, control.accent),
                        theme.palette.mode === "dark" ? 0.28 : 0.24
                      )}`
                    : `0 14px 34px ${alpha(
                        theme.palette.common.black,
                        theme.palette.mode === "dark" ? 0.34 : 0.12
                      )}`,
                transition:
                  "background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
                "&:hover": {
                  color: (theme) => accentColor(theme, control.accent),
                  backgroundColor: (theme) =>
                    alpha(
                      accentColor(theme, control.accent),
                      theme.palette.mode === "dark" ? 0.24 : 0.12
                    ),
                  borderColor: (theme) =>
                    alpha(accentColor(theme, control.accent), 0.5),
                  transform: "translateY(-1px)",
                  boxShadow: (theme) =>
                    `0 16px 36px ${alpha(
                      accentColor(theme, control.accent),
                      theme.palette.mode === "dark" ? 0.34 : 0.26
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
