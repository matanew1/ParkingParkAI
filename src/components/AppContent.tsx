// AppContent.tsx
import React, { lazy, Suspense, useCallback } from "react";
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
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import OptionDialog from "./Options/OptionDialog";
import { useParkingContext } from "../Context/ParkingContext";
import type { ParkingSpotWithStatus } from "../Types/parking";

// Lazy load the map component to improve initial load time
const ParkingMap = lazy(() => import("./Map/ParkingMap"));

const AppContent: React.FC = () => {
  // State for option popup
  const [isOptionPopupOpen, setIsOptionPopupOpen] =
    React.useState<boolean>(false);

  // Theme and responsive layout
  const { isDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Local sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!isMobile);

  // Selected spot for sidebar-map interaction
  const [selectedSpotId, setSelectedSpotId] = React.useState<string | null>(
    null
  );

  // Get parking context data
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

  const drawerWidth = isMobile ? "80%" : 320;

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
      setMapCenter([
        parseFloat(spot.GPSLattitude),
        parseFloat(spot.GPSLongitude),
      ]);
      setSelectedSpotId(spot.AhuzotCode);
      setSelectedSpot(`${spot.GPSLattitude},${spot.GPSLongitude}`);
    },
    [setMapCenter, setSelectedSpot]
  );

  const handleSpotSelect = useCallback((spotId: string | null) => {
    setSelectedSpotId(spotId);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppHeader onOpenOptionPopup={handleOpenOptionPopup} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 7, sm: 8, md: 9 },
            display: "flex",
            height: "calc(100vh - 64px)",
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
                transition: theme.transitions.create(["width", "margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
          >
            <Sidebar
              spots={parkingSpots}
              onSpotClick={handleSpotClick}
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
                  left: 20,
                  top: { xs: 72, sm: 80, md: 88 },
                  zIndex: 1200,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: theme.shadows[3],
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                <Menu size={24} />
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
              <ParkingMap
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
              />
            </Suspense>
          </Box>
        </Box>
      </Box>
      <OptionDialog
        isOpen={isOptionPopupOpen}
        onClose={handleCloseOptionPopup}
      />
    </MuiThemeProvider>
  );
};

export default React.memo(AppContent);
