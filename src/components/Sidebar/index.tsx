// components/Sidebar/index.tsx
import React from "react";
import { SidebarProps } from "../../Types/parking";
import { Box, Typography, Paper, alpha, useMediaQuery } from "@mui/material";
import SidebarHeader from "./SidebarHeader";
import ParkingSearch from "./ParkingSearch";
import RefreshControl from "./RefreshControl";
import VirtualizedParkingList from "./VirtualizedParkingList";
import { Clock, MapPin } from "lucide-react";

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

      <Box sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        flexGrow: 1, 
        overflow: "hidden", 
        display: "flex", 
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
      }}>
        <ParkingSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <LastUpdatedInfo lastUpdated={lastUpdated} isMobile={isMobile} />

        {!isSmallMobile && (
          <RefreshControl
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            statusError={statusError}
          />
        )}

        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <VirtualizedParkingList
            filteredSpots={filteredSpots}
            onSpotClick={onSpotClick}
            onSpotSelect={onSpotSelect}
            toggleDrawer={toggleDrawer}
            isMobile={isMobile}
          />
        </Box>
        
        {isSmallMobile && (
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
