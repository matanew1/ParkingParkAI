import React from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton, Tooltip, alpha } from "@mui/material";
import { useTheme as useCustomTheme } from "../../Context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useCustomTheme();

  return (
    <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`} arrow>
    <IconButton
      onClick={toggleTheme}
      color="default"
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      sx={{ 
        backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.1),
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        '&:hover': {
          backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.2),
          transform: 'scale(1.05)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {isDarkMode ? (
        <Sun size={18} style={{ color: '#FFD700' }} />
      ) : (
        <Moon size={18} />
      )}
    </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
