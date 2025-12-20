import React from "react";
import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = 40,
  fullScreen = false,
}) => {
  const containerSx = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }
    : {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
      };

  return (
    <Box sx={containerSx}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={fullScreen ? 0 : 3}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <CircularProgress size={size} thickness={4} />
          </motion.div>
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default LoadingSpinner;
