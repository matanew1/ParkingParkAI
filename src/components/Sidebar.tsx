import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { SidebarProps } from '../types/parking';
import { AxiosError } from 'axios';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Divider,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Sidebar: React.FC<SidebarProps> = ({ 
  spots, 
  onSpotClick, 
  lastUpdated, 
  onRefresh, 
  isRefreshing 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lastValidStatus, setLastValidStatus] = useState<any>(null);
  const [cachedData, setCachedData] = useState<any>(null);
  
  useEffect(() => {
    // Try to load cached data on mount
    const cachedStatus = localStorage.getItem('lastValidStatus');
    if (cachedStatus) {
      setCachedData(JSON.parse(cachedStatus));
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update isOpen state when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const filteredSpots = spots.filter(spot => 
    spot.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    spot.Address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Handle refresh error, and preserve last valid status or use cache
  const handleRefresh = async () => {
    try {
      onRefresh(); // Assuming onRefresh will handle the fetch and update status
      setLastValidStatus(null); // Reset last valid status on refresh attempt
    } catch (error) {
      // Check if the error is an AxiosError
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 500) {
          // Preserve last valid status if error code is 500, and try to load from cache
          setLastValidStatus(lastValidStatus);
          const cachedStatus = localStorage.getItem('lastValidStatus');
          if (cachedStatus) {
            setCachedData(JSON.parse(cachedStatus)); // Use cached data if available
          }
        } else {
          setLastValidStatus(null); // Reset on other types of errors
          setCachedData(null); // Clear cache on errors
        }
      } else {
        // Handle non-AxiosError or unknown error types
        setLastValidStatus(null);
        setCachedData(null);
      }
    }
  };

  const handleSpotStatus = (spot: any) => {
    if (spot.status && spot.status.InformationToShow !== 'Unknown') {
      // If the spot status is not 'Unknown', return the current status
      return spot.status.InformationToShow;
    }
    // If the status is "Unknown", use the last valid status from cache (if available)
    if (cachedData) {
      return cachedData;
    }
    // If there is no valid status, return the string "Status unavailable" or similar
    return 'Status unavailable... Please refresh again';
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const drawerWidth = isMobile ? '100%' : 320;
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer}
        sx={{
          width: isOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100vh - 64px)',
            zIndex: 1000,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6">Parking Spots</Typography>
          {isMobile && (
            <IconButton 
              onClick={toggleDrawer}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ p: 2, height: 'calc(100% - 60px)', overflow: 'auto' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search parking spots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Clock size={16} />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {lastUpdated 
                  ? `Updated: ${lastUpdated.toLocaleTimeString()}` 
                  : 'Loading data...'}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={handleRefresh}
              disabled={isRefreshing}
              startIcon={
                isRefreshing ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )
              }
            >
              Refresh
            </Button>
          </Box>

          <Divider sx={{ my: 1 }} />

          <List disablePadding>
            {filteredSpots.length > 0 ? (
              filteredSpots.map((spot) => (
                <Paper 
                  key={spot.AhuzotCode}
                  elevation={1}
                  sx={{ 
                    mb: 1,
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <ListItemButton onClick={() => onSpotClick(spot)}>
                    <ListItem disablePadding>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" noWrap>{spot.Name}</Typography>
                          <ChevronRight size={16} color={theme.palette.text.secondary} />
                        </Box>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {spot.Address}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Chip
                            label={handleSpotStatus(spot)}
                            size="small"
                            color={handleSpotStatus(spot) === 'מלא' ? 'error' : 'success'}
                            sx={{ height: 24 }}
                          />
                          {spot.status && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Clock size={12} />
                              <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                                {new Date(spot.status.LastUpdateFromDambach).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  </ListItemButton>
                </Paper>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  No parking spots match your search.
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Drawer>

      <Fade in={!isOpen}>
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            left: 16,
            top: 80,
            zIndex: 1001,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            },
            transition: theme.transitions.create(['opacity', 'transform'], {
              duration: theme.transitions.duration.standard,
            }),
          }}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </IconButton>
      </Fade>
    </Box>
  );
};

export default Sidebar;