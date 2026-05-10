import React from "react";
import { SidebarProps } from "../../Types/parking";
import {
  Box,
  Typography,
  alpha,
  useMediaQuery,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import SidebarHeader from "./SidebarHeader";
import ParkingSearch from "./ParkingSearch";
import RefreshControl from "./RefreshControl";
import VirtualizedParkingList from "./VirtualizedParkingList";
import FavoritesList from "../favorites/FavoritesList";
import { Clock, MapPin, Star, Map, Sparkles } from "lucide-react";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { motion, AnimatePresence } from "framer-motion";

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
  const { favoritesCount } = useFavoritesStore();
  const isSmallMobile = useMediaQuery("(max-width:480px)");

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredSpots = React.useMemo(
    () =>
      spots.filter(
        (spot) =>
          spot.shem_chenyon
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          spot.ktovet.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [spots, debouncedSearch]
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    if (newValue === 1) setSearchTerm("");
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
    >
      <SidebarHeader toggleDrawer={toggleDrawer} isMobile={isMobile} />

      {/* Modern Tab Bar */}
      <Box
        sx={{
          px: 2,
          pt: 1,
          pb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.5),
            borderRadius: 3,
            p: 0.5,
          }}
        >
          <TabButton
            active={currentTab === 0}
            onClick={() => handleTabChange(null as any, 0)}
            icon={<Map size={16} />}
            label="All Spots"
          />
          <TabButton
            active={currentTab === 1}
            onClick={() => handleTabChange(null as any, 1)}
            icon={<Star size={16} />}
            label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount})` : ""}`}
          />
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          px: 2,
          pb: 2,
          overflow: "hidden",
          gap: 2,
        }}
      >
        {currentTab === 0 && (
          <>
            <ParkingSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            {/* Status Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Clock size={14} color="text.secondary" />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  {lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString()}`
                    : "Loading..."}
                </Typography>
              </Box>
              <RefreshControl
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
                statusError={statusError}
              />
            </Box>
          </>
        )}

        {/* List Content */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            {currentTab === 0 ? (
              <motion.div
                key="parking"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ height: "100%" }}
              >
                <VirtualizedParkingList
                  filteredSpots={filteredSpots}
                  onSpotClick={onSpotClick}
                  onSpotSelect={onSpotSelect}
                  toggleDrawer={toggleDrawer}
                  isMobile={isMobile}
                />
              </motion.div>
            ) : (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ height: "100%" }}
              >
                <FavoritesList
                  onSpotClick={onSpotClick}
                  onSpotSelect={onSpotSelect}
                  toggleDrawer={toggleDrawer}
                  isMobile={isMobile}
                  maxHeight="100%"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

// Custom Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.75,
      py: 1.25,
      px: 2,
      borderRadius: 2.5,
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: active ? "background.paper" : "transparent",
      boxShadow: active ? (theme) => `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}` : "none",
      color: active ? "text.primary" : "text.secondary",
      fontWeight: active ? 600 : 500,
      fontSize: "0.8rem",
      "&:hover": {
        backgroundColor: active
          ? "background.paper"
          : (theme) => alpha(theme.palette.action.hover, 0.3),
      },
    }}
  >
    {icon}
    <Typography
      variant="body2"
      sx={{
        fontWeight: "inherit",
        fontSize: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default Sidebar;
