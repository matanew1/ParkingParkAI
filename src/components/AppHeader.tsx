import React from "react";
import { MapPin } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import ThemeToggle from "./Theme/ThemeToggle";
import AIButton from "./AI/AIButton";

interface AppHeaderProps {
  onOpenAIPopup: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenAIPopup }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="parking location"
          sx={{ mr: 2 }}
        >
          <MapPin size={24} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h1" noWrap>
            Tel Aviv Parking Map
          </Typography>
          {!isMobile && (
            <Typography variant="caption" component="p" noWrap>
              Find available parking spots in the city
            </Typography>
          )}
        </Box>

        <ThemeToggle />
        <AIButton onClick={onOpenAIPopup} />
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
