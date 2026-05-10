import React from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton, Tooltip, alpha, useMediaQuery } from "@mui/material";
import { useThemeStore } from "../../stores/themeStore";
import { motion } from "framer-motion";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`} arrow>
      <IconButton
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: 2,
          backgroundColor: (theme) =>
            alpha(isDarkMode ? "#fbbf24" : "#3b82f6", 0.1),
          color: isDarkMode ? "#fbbf24" : "#3b82f6",
          "&:hover": {
            backgroundColor: (theme) =>
              alpha(isDarkMode ? "#fbbf24" : "#3b82f6", 0.2),
          },
          transition: "all 0.2s ease-in-out",
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
            <Sun size={isMobile ? 18 : 20} />
          ) : (
            <Moon size={isMobile ? 18 : 20} />
          )}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
