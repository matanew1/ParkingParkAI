import React from "react";
import { Box, Fab, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import { RefreshCw, Crosshair, Trash2, Play, Pause } from "lucide-react";
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
  const theme = useTheme();

  const controls = [
    {
      icon: refreshing ? <RefreshCw className="animate-spin" /> : <RefreshCw />,
      label: "Refresh Data",
      onClick: onRefresh,
      color: "primary",
    },
    {
      icon: <Crosshair />,
      label: "Center on Location",
      onClick: onCenterUser,
      color: "secondary",
    },
    {
      icon: <Trash2 />,
      label: "Reset Map",
      onClick: onResetMap,
      color: "error",
    },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: 100, sm: 120 },
        right: { xs: 16, sm: 24 },
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {controls.map((control, index) => (
        <motion.div
          key={control.label}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Tooltip title={control.label} placement="left" arrow>
            <Fab
              size={isMobile ? "small" : "medium"}
              color={control.color as any}
              onClick={control.onClick}
              sx={{
                boxShadow: theme.shadows[4],
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: theme.shadows[8],
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {control.icon}
            </Fab>
          </Tooltip>
        </motion.div>
      ))}
    </Box>
  );
};

export default React.memo(MapControls);
