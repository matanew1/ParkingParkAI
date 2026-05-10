import React, { lazy, Suspense, useCallback, useState } from "react";
import { Menu, X, List, Map as MapIcon } from "lucide-react";
import {
  Box,
  IconButton,
  useMediaQuery,
  Drawer,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  alpha,
  Fab,
  Zoom,
  useTheme,
  SwipeableDrawer,
  Typography,
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
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

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

  const drawerWidth = isMobile ? "100%" : isTablet ? "360px" : "380px";

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
      setSelectedSpotId(spot.code_achoza.toString());
      setSelectedSpot(`${spot.lat},${spot.lon}`);
      if (isMobile) {
        setMobileView("map");
        setIsSidebarOpen(false);
      }
    },
    [setSelectedSpot, isMobile]
  );

  const handleSpotSelectFromSidebar = useCallback(
    (spot: ParkingSpotWithStatus) => {
      setMapCenter([spot.lat, spot.lon]);
      setSelectedSpotId(spot.code_achoza.toString());
      setSelectedSpot(`${spot.lat},${spot.lon}`);
      if (isMobile) {
        setMobileView("map");
        setIsSidebarOpen(false);
      }
    },
    [setMapCenter, setSelectedSpot, isMobile]
  );

  const handleSpotSelect = useCallback((spotId: string | null) => {
    setSelectedSpotId(spotId);
  }, []);

  // Mobile bottom sheet drawer
  const MobileDrawer = isMobile ? SwipeableDrawer : Drawer;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "background.default",
        }}
      >
        <AppHeader onOpenOptionPopup={handleOpenOptionPopup} />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: "64px", sm: "70px" },
            display: "flex",
            height: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Desktop/Tablet Sidebar */}
          {!isMobile && (
            <Drawer
              variant="persistent"
              anchor="left"
              open={isSidebarOpen}
              sx={{
                width: isSidebarOpen ? drawerWidth : 0,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                  top: { xs: "64px", sm: "70px" },
                  height: { xs: "calc(100% - 64px)", sm: "calc(100% - 70px)" },
                  borderRight: (theme) =>
                    `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: "blur(20px)",
                  transition: "width 0.3s ease",
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
          )}

          {/* Mobile Bottom Sheet */}
          {isMobile && (
            <MobileDrawer
              anchor="bottom"
              open={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onOpen={() => setIsSidebarOpen(true)}
              disableSwipeToOpen={false}
              swipeAreaWidth={20}
              ModalProps={{
                keepMounted: true,
              }}
              PaperProps={{
                sx: {
                  height: "85vh",
                  borderRadius: "24px 24px 0 0",
                  backgroundColor: (theme) =>
                    alpha(theme.palette.background.paper, 0.98),
                  backdropFilter: "blur(20px)",
                  overflow: "hidden",
                },
              }}
            >
              {/* Drag Handle */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  pt: 1.5,
                  pb: 1,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "divider",
                  }}
                />
              </Box>
              <Sidebar
                spots={parkingSpots}
                onSpotClick={handleSpotSelectFromSidebar}
                onSpotSelect={handleSpotSelect}
                statusError={error}
                lastUpdated={lastUpdated}
                onRefresh={() => fetchParkingData(true)}
                isRefreshing={refreshing}
                toggleDrawer={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
              />
            </MobileDrawer>
          )}

          {/* Map Container */}
          <Box
            sx={{
              flexGrow: 1,
              position: "relative",
              height: "100%",
              transition: "margin 0.3s ease",
              marginLeft: !isMobile && isSidebarOpen ? 0 : 0,
            }}
          >
            {/* Desktop Toggle Button */}
            {!isMobile && (
              <Zoom in={!isSidebarOpen}>
                <Fab
                  size="medium"
                  color="primary"
                  onClick={toggleSidebar}
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: 16,
                    zIndex: 1000,
                    boxShadow: (theme) =>
                      `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <List size={22} />
                </Fab>
              </Zoom>
            )}

            <Suspense
              fallback={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    backgroundColor: "background.default",
                  }}
                >
                  <LoadingSpinner message="Loading map..." />
                </Box>
              }
            >
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

        {/* Mobile FAB to open list */}
        {isMobile && (
          <Fab
            color="primary"
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              width: 56,
              height: 56,
              boxShadow: (theme) =>
                `0 4px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}
          >
            <List size={24} />
          </Fab>
        )}
      </Box>

      <OptionDialog
        isOpen={isOptionPopupOpen}
        onClose={handleCloseOptionPopup}
      />
    </MuiThemeProvider>
  );
};

export default React.memo(AppContent);
