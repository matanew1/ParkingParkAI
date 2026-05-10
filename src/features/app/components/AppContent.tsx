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
  alpha,
} from "@mui/material";
import { useThemeStore } from "../../../stores/themeStore";
import { useParkingStore } from "../../../stores/parkingStore";
import { useNotificationStore } from "../../../stores/notificationStore";
import { lightTheme, darkTheme } from "../../../components/Theme/ThemeConfig";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "./AppHeader";
import { Sidebar } from "../../sidebar";
import { OptionDialog } from "../../options";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import type { ParkingSpotWithStatus } from "../../../Types/parking";

const OptimizedParkingMap = lazy(() => import("../../map/OptimizedParkingMap"));

const AppContent: React.FC = () => {
  const [isOptionPopupOpen, setIsOptionPopupOpen] = useState<boolean>(false);
  const { isDarkMode } = useThemeStore();
  const isMobile = useMediaQuery("(max-width:768px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const {
    parkingSpots,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchParkingData,
    mapCenter,
    setMapCenter,
    setSelectedSpot,
    handleResetMap,
  } = useParkingStore();

  const { isMonitoring } = useNotificationStore();

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
      setMapCenter([spot.lat, spot.lon]);
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            transition: "background 0.3s ease",
          }}
        >
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
                  overflow: "hidden",
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)"
                      : "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "4px 0 20px rgba(0,0,0,0.3)"
                      : "4px 0 20px rgba(0,0,0,0.1)",
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
                statusError={error}
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
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Menu size={isMobile ? 20 : 24} />
                </IconButton>
              </Fade>

              <Suspense fallback={<LoadingSpinner message="Loading map..." />}>
                <OptimizedParkingMap
                  parkingSpots={parkingSpots}
                  loading={loading}
                  statusError={error}
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
