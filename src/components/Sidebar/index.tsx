// components/Sidebar/index.tsx
import React from "react";
import { SidebarProps } from "../../Types/parking";
import { Box, Typography } from "@mui/material";
import SidebarHeader from "./SidebarHeader";
import ParkingSearch from "./ParkingSearch";
import RefreshControl from "./RefreshControl";
import ParkingList from "./ParkingList";
import { Clock } from "lucide-react";

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
          spot.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          spot.Address.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [spots, debouncedSearch]
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SidebarHeader toggleDrawer={toggleDrawer} isMobile={isMobile} />

      <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
        <ParkingSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <LastUpdatedInfo lastUpdated={lastUpdated} />

        <RefreshControl
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          statusError={statusError}
        />

        <ParkingList
          filteredSpots={filteredSpots}
          onSpotClick={onSpotClick}
          onSpotSelect={onSpotSelect}
          toggleDrawer={toggleDrawer}
          isMobile={isMobile}
        />
      </Box>
    </Box>
  );
};

// Simple component for displaying last updated info
const LastUpdatedInfo = ({ lastUpdated }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Clock size={16} />
        <Typography variant="caption" sx={{ ml: 1 }}>
          {lastUpdated
            ? `Updated: ${lastUpdated.toLocaleTimeString()}`
            : "Loading data..."}
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
