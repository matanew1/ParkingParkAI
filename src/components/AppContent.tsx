import React, { lazy, Suspense, useCallback, useState } from "react";
import { Menu } from "lucide-react";
import {
  Box,
  IconButton,
  useMediaQuery,
  CircularProgress,
  Drawer,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  Fade,
  Typography,
} from "@mui/material";
import { useTheme as useCustomTheme } from "../Context/ThemeContext";
import { lightTheme, darkTheme } from "./Theme/ThemeConfig";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import OptionDialog from "./Options/OptionDialog";
import { useParkingContext } from "../Context/ParkingContext";
import { useParkingNotificationIntegration } from "../hooks/useParkingNotificationIntegration";
import type { ParkingSpotWithStatus } from "../Types/parking";

const OptimizedParkingMap = lazy(() => import("./Map/OptimizedParkingMap"));

const AppContent: React.FC = () => {
  const [isOptionPopupOpen, setIsOptionPopupOpen] = useState<boolean>(false);
  const { isDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery("(max-width:768px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Initialize parking notification integration
  const { isMonitoring } = useParkingNotificationIntegration();

  const {
    parkingSpots,
    loading,
    statusError,
    lastUpdated,
    refreshing,
    fetchParkingData,
    mapCenter,
    setMapCenter,
    setSelectedSpot,
    handleResetMap,
  } = useParkingContext();

  const drawerWidth = isMobile ? "85%" : isTablet ? "40%" : 360;

  const handleResetMapApp = useCallback((): void => {
    setSelectedSpotId(null);
    setSelectedSpot(null);
    handleResetMap();
  }, [setSelectedSpot, handleResetMap]);

  const handleOpenOptionPopup = useCallback((): void => {
    setIsOptionPopupOpen(true);
  }, []);

  const handleCloseOptionPopup = useCallback((): void => {
    setIsOptionPopupOpen(false);
  }, []);

  const toggleSidebar = useCallback((): void => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSpotClick = useCallback(
    (spot: ParkingSpotWithStatus) => {
      // When clicking a marker, we want the popup to open immediately
      setSelectedSpotId(spot.code_achoza.toString());
      setSelectedSpot(`${spot.lat},${spot.lon}`);
    },
    [setSelectedSpot]
  );

  const handleSpotSelectFromSidebar = useCallback(
    (spot: ParkingSpotWithStatus) => {
      // When selecting from sidebar, move the map and ensure popup opens
      setMapCenter([
        spot.lat,
        spot.lon,
      ]);
      setSelectedSpotId(spot.code_achoza.toString());
      setSelectedSpot(`${spot.lat},${spot.lon}`);
    },
    [setMapCenter, setSelectedSpot]
  );

  const handleSpotSelect = useCallback((spotId: string | null) => {
    setSelectedSpotId(spotId);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppHeader onOpenOptionPopup={handleOpenOptionPopup} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              pt: { xs: 7, sm: 8, md: 9 },
              display: "flex",
              height: "calc(100vh - 64px)",
              overflow: "hidden", // Prevent main container from scrolling
            }}
          >
            <Drawer
              variant={isMobile ? "temporary" : "persistent"}
              anchor="left"
              open={isSidebarOpen}
              onClose={toggleSidebar}
              sx={{
                width: isSidebarOpen ? drawerWidth : 0,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                  zIndex: 1000,
                  position: "relative",
                  height: "100%",
                  overflow: "hidden", // Prevent drawer from creating its own scrollbar
                  transition: theme.transitions.create(["width", "margin"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                },
              }}
            >
              <Sidebar
                spots={parkingSpots}
                onSpotClick={handleSpotSelectFromSidebar}
                onSpotSelect={handleSpotSelect}
                statusError={statusError}
                lastUpdated={lastUpdated}
                onRefresh={() => fetchParkingData(true)}
                isRefreshing={refreshing}
                toggleDrawer={toggleSidebar}
                isMobile={isMobile}
              />
            </Drawer>

            <Box
              sx={{
                flexGrow: 1,
                position: "relative",
                transition: theme.transitions.create(["margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }}
            >
              <Fade in={!isSidebarOpen}>
                <IconButton
                  onClick={toggleSidebar}
                  sx={{
                    position: "fixed",
                    left: { xs: 12, sm: 16, md: 20 },
                    top: { xs: 68, sm: 76, md: 88 },
                    zIndex: 1200,
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: theme.shadows[3],
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Menu size={isMobile ? 20 : 24} />
                </IconButton>
              </Fade>

              <Suspense
                fallback={
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                  >
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading map...
                    </Typography>
                  </Box>
                }
              >
                <OptimizedParkingMap
                  parkingSpots={parkingSpots}
                  loading={loading}
                  statusError={statusError}
                  mapCenter={mapCenter}
                  lastUpdated={lastUpdated}
                  refreshing={refreshing}
                  onRefresh={() => fetchParkingData(true)}
                  setMapCenter={setMapCenter}
                  selectedSpotId={selectedSpotId}
                  onResetMap={handleResetMapApp}
                  onSpotClick={handleSpotClick}
                />
              </Suspense>
            </Box>
          </Box>
        </Box>
      </motion.div>
      <OptionDialog
        isOpen={isOptionPopupOpen}
        onClose={handleCloseOptionPopup}
      />
    </MuiThemeProvider>
  );
};

export default React.memo(AppContent);