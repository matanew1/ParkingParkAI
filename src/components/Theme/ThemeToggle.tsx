import React from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton } from "@mui/material";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useCustomTheme();

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      sx={{ ml: 1 }}
    >
      {isDarkMode ? <Sun size={20} color="#FFD700" /> : <Moon size={20} />}
    </IconButton>
  );
};

export default ThemeToggle;
