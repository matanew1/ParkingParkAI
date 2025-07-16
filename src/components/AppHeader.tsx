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
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backdropFilter: 'blur(20px)',
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 56, sm: 64, md: 70 },
        px: { xs: 1, sm: 2, md: 3 },
        gap: { xs: 1, sm: 2 }
      }}>
        <IconButton
          edge="start"
          color="primary"
          aria-label="parking location"
          sx={{ 
            mr: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 1.5 },
            minWidth: { xs: 40, sm: 48 },
            minHeight: { xs: 40, sm: 48 },
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <MapPin size={isSmallMobile ? 18 : isMobile ? 20 : 24} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant={isSmallMobile ? "subtitle1" : isMobile ? "h6" : "h5"} 
            component="h1" 
            noWrap
            sx={{
              fontWeight: { xs: 600, sm: 700 },
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            {isSmallMobile ? "TLV Parking" : "Tel Aviv Parking Map"}
          </Typography>
          {!isSmallMobile && (
            <Typography 
              variant="body2" 
              component="p" 
              noWrap
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                mt: -0.5,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {isMobile ? "Find parking spots" : "Find available parking spots in the city"}
            </Typography>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.5, sm: 1 },
          flexShrink: 0
        }}>
        <ThemeToggle />
        <OptionButton onClick={onOpenOptionPopup} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
