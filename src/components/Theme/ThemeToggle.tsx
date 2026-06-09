import React from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton, Tooltip, alpha, useMediaQuery, useTheme } from "@mui/material";
import { useThemeStore } from "../../stores/themeStore";
import { motion } from "framer-motion";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();
  const iconColor = isDarkMode ? theme.palette.warning.main : theme.palette.primary.main;

  return (
    <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`} arrow>
      <IconButton
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        sx={{
          width: { xs: 38, sm: 42 },
          height: { xs: 38, sm: 42 },
          borderRadius: "12px",
          backgroundColor: alpha(iconColor, theme.palette.mode === "dark" ? 0.16 : 0.1),
          color: iconColor,
          border: `1px solid ${alpha(iconColor, theme.palette.mode === "dark" ? 0.26 : 0.16)}`,
          "&:hover": {
            backgroundColor: alpha(iconColor, theme.palette.mode === "dark" ? 0.24 : 0.16),
            transform: "translateY(-1px)",
          },
          transition:
            "background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
        }}
      >
        <motion.div
          key={isDarkMode ? "sun" : "moon"}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          {isDarkMode ? (
            <Sun size={isMobile ? 17 : 20} />
          ) : (
            <Moon size={isMobile ? 17 : 20} />
          )}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
