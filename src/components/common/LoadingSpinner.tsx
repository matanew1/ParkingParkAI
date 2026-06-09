import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Car } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = 48,
  fullScreen = false,
}) => {
  const theme = useTheme();

  const containerSx = fullScreen
    ? {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: alpha(theme.palette.background.default, 0.9),
        backdropFilter: "blur(8px)",
      }
    : {
        width: "100%",
        height: "100%",
        minHeight: "200px",
      };

  return (
    <Box
      sx={{
        ...containerSx,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Animated Logo */}
        <Box sx={{ position: "relative" }}>
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{
              width: size + 24,
              height: size + 24,
              borderRadius: "50%",
              border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderTopColor: theme.palette.primary.main,
              position: "absolute",
              top: -12,
              left: -12,
            }}
          />
          {/* Inner icon */}
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: "10px",
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Car size={size * 0.5} color={theme.palette.primary.main} />
            </motion.div>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.875rem",
          }}
        >
          {message}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingSpinner;
