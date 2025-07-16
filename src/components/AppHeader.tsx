import React from "react";
import { MapPin, Menu } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  alpha,
} from "@mui/material";
import ThemeToggle from "./Theme/ThemeToggle";
import OptionButton from "./Options/OptionButton";
import { AppHeaderProps } from "../Types/app";

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenOptionPopup }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backdropFilter: 'blur(20px)',
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
        <IconButton
          edge="start"
          color="primary"
          aria-label="parking location"
          sx={{ 
            mr: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <MapPin size={isMobile ? 20 : 24} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1" 
            noWrap
            sx={{
              fontWeight: 700,
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Tel Aviv Parking Map
          </Typography>
          {!isMobile && (
            <Typography 
              variant="body2" 
              component="p" 
              noWrap
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mt: -0.5,
              }}
            >
              Find available parking spots in the city
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ThemeToggle />
        <OptionButton onClick={onOpenOptionPopup} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
