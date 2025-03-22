// AppContent.tsx
import React, { lazy, Suspense, useState, useCallback, useEffect } from "react";
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
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "./Theme/ThemeConfig";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import AIDialog from "./AI/AIDialog";
import { ParkingService } from "../services/parkingService";
import type { ParkingSpotWithStatus } from "../types/parking";
import ParkingContext from "../context/ParkingContext";

const ParkingMap = lazy(() => import("./Map/ParkingMap"));
const parkingService = new ParkingService();

const AppContent: React.FC = () => {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState<boolean>(false);
  const { isDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    32.0853, 34.7818,
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null); // New state for selected spot

  const { setSelectedSpot } = React.useContext(ParkingContext);

  const drawerWidth = isMobile ? "80%" : 320;

  const handleOpenAIPopup = (): void => {
    setIsAIPopupOpen(true);
  };

  const handleCloseAIPopup = (): void => {
    setIsAIPopupOpen(false);
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchParkingData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }
      const [spots, statusMap] = await Promise.all([
        parkingService.fetchParkingSpots(),
        parkingService.fetchParkingStatus(),
      ]);
      const spotsWithStatus = spots.map((spot) => ({
        ...spot,
        status: statusMap.get(spot.AhuzotCode),
      }));
      setParkingSpots(spotsWithStatus);
      setLastUpdated(new Date());
      setError(null);
      setStatusError(null);
    } catch (err) {
      console.error("Error fetching parking data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load parking data. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(() => fetchParkingData(), 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  const handleSpotClick = useCallback(
    (spot: ParkingSpotWithStatus) => {
      setMapCenter([
        parseFloat(spot.GPSLattitude),
        parseFloat(spot.GPSLongitude),
      ]);
      setSelectedSpotId(spot.AhuzotCode);
      setSelectedSpot(String(spot.GPSLattitude) +','+ String(spot.GPSLongitude));
    },
    [setSelectedSpot]
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
        <AppHeader onOpenAIPopup={handleOpenAIPopup} />
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
                width: isSidebarOpen ? drawerWidth : 0,
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
              onSpotSelect={handleSpotSelect} // Pass new handler
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
                  <Typography variant="body2">Loading map...</Typography>
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
                selectedSpotId={selectedSpotId} // Pass selected spot ID
              />
            </Suspense>
          </Box>
        </Box>
      </Box>
      <AIDialog isOpen={isAIPopupOpen} onClose={handleCloseAIPopup} />
    </MuiThemeProvider>
  );
};

export default AppContent;
