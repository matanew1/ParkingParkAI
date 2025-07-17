import React, { useState } from "react";
import { MapPin, Menu, Star } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  alpha,
  Badge,
  Tooltip,
} from "@mui/material";
import ThemeToggle from "./Theme/ThemeToggle";
import OptionButton from "./Options/OptionButton";
import { NotificationBadge, NotificationPanel } from "./Notifications";
import { AppHeaderProps } from "../Types/app";
import { useFavorites } from "../Context/FavoritesContext";

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenOptionPopup }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const { favoritesCount } = useFavorites();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

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
          {/* Notifications */}
          <NotificationBadge
            onClick={() => setNotificationPanelOpen(true)}
            size={isMobile ? "small" : "medium"}
          />

          {/* Favorites Badge */}
          {favoritesCount > 0 && (
            <Tooltip title={`${favoritesCount} favorite parking spots`}>
              <Badge 
                badgeContent={favoritesCount} 
                color="warning"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: (theme) => theme.palette.warning.main,
                    color: (theme) => theme.palette.warning.contrastText,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }
                }}
              >
                <IconButton
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    color: (theme) => theme.palette.warning.main,
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.2),
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Star size={isMobile ? 16 : 18} fill="currentColor" />
                </IconButton>
              </Badge>
            </Tooltip>
          )}
          
          <ThemeToggle />
          <OptionButton onClick={onOpenOptionPopup} />
        </Box>
      </Toolbar>
      
      {/* Notification Panel */}
      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        onNavigateToSpot={(spotId) => {
          // This will be handled by the parent component
          console.log('Navigate to spot:', spotId);
        }}
      />
    </AppBar>
  );
};

export default AppHeader;
