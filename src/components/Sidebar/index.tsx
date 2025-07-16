// components/Sidebar/index.tsx
import React from "react";
import { SidebarProps } from "../../Types/parking";
import { Box, Typography, Paper, alpha, useMediaQuery, Tabs, Tab } from "@mui/material";
import SidebarHeader from "./SidebarHeader";
import ParkingSearch from "./ParkingSearch";
import RefreshControl from "./RefreshControl";
import VirtualizedParkingList from "./VirtualizedParkingList";
import FavoritesList from "../Favorites/FavoritesList";
import { Clock, MapPin, Star, Map } from "lucide-react";
import { useFavorites } from "../../Context/FavoritesContext";

const Sidebar: React.FC<SidebarProps> = ({
  spots,
  onSpotClick,
  onSpotSelect,
  lastUpdated,
  onRefresh,
  isRefreshing,
  toggleDrawer,
  isMobile,
  statusError,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [currentTab, setCurrentTab] = React.useState(0);
  const { favoritesCount } = useFavorites();
  const isSmallMobile = useMediaQuery("(max-width:480px)");

  // Handle search debouncing
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filter spots based on search
  const filteredSpots = React.useMemo(
    () =>
      spots.filter(
        (spot) =>
          spot.shem_chenyon.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          spot.ktovet.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [spots, debouncedSearch]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // Clear search when switching tabs
    if (newValue === 1) {
      setSearchTerm("");
    }
  };

  return (
    <Box 
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(20px)',
      }}
    >
      <SidebarHeader toggleDrawer={toggleDrawer} isMobile={isMobile} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 600,
            },
          }}
        >
          <Tab 
            icon={<Map size={16} />} 
            label="Parking" 
            iconPosition="start"
            sx={{ gap: 0.5 }}
          />
          <Tab 
            icon={<Star size={16} />} 
            label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
            iconPosition="start"
            sx={{ gap: 0.5 }}
          />
        </Tabs>
      </Box>

      <Box sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        flexGrow: 1, 
        overflow: "hidden", 
        display: "flex", 
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
      }}>
        {/* Show search only for parking tab */}
        {currentTab === 0 && (
          <ParkingSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}

        {currentTab === 0 && (
          <LastUpdatedInfo lastUpdated={lastUpdated} isMobile={isMobile} />
        )}

        {currentTab === 0 && !isSmallMobile && (
          <RefreshControl
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            statusError={statusError}
          />
        )}

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {currentTab === 0 ? (
            <VirtualizedParkingList
              filteredSpots={filteredSpots}
              onSpotClick={onSpotClick}
              onSpotSelect={onSpotSelect}
              toggleDrawer={toggleDrawer}
              isMobile={isMobile}
            />
          ) : (
            <FavoritesList
              onSpotClick={onSpotClick}
              onSpotSelect={onSpotSelect}
              toggleDrawer={toggleDrawer}
              isMobile={isMobile}
              maxHeight="100%"
            />
          )}
        </Box>
        
        {currentTab === 0 && isSmallMobile && (
          <Box sx={{ pt: 1 }}>
            <RefreshControl
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              statusError={statusError}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Simple component for displaying last updated info
const LastUpdatedInfo = ({ lastUpdated, isMobile }) => {
  return (
    <Paper  
      elevation={0}
      sx={{
        p: { xs: 1, sm: 1 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Clock size={isMobile ? 14 : 16} color="text.secondary" />
        <Typography 
          variant="body2" 
          sx={{ 
            ml: 1, 
            fontWeight: 500,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {lastUpdated
            ? `${isMobile ? '' : 'Updated: '}${lastUpdated.toLocaleTimeString()}`
            : "Loading data..."}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Sidebar;
