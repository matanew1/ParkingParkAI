import React, { lazy, Suspense, useState, useCallback } from "react";
import { MapPin, Wand2, Sun, Moon, Menu } from "lucide-react";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme as useCustomTheme,
} from "./context/ThemeContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  useMediaQuery,
  CircularProgress,
  Drawer,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  Fade,
} from "@mui/material";
import Sidebar from "./components/Sidebar";
import {
  fetchParkingSpots,
  fetchParkingStatus,
} from "./services/parkingService";
import type { ParkingSpotWithStatus } from "./types/parking";

// Lazy loaded components
const ParkingMap = lazy(() => import("./components/ParkingMap"));
const AIPopup = lazy(() => import("./components/AIPopup"));

// Create responsive Material UI themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useCustomTheme();

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      sx={{ ml: 1 }}
    >
      {isDarkMode ? <Sun size={20} color="#FFD700" /> : <Moon size={20} />}
    </IconButton>
  );
};

interface AIButtonProps {
  onClick: () => void;
}

const AIButton: React.FC<AIButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      startIcon={<Wand2 size={20} />}
      size={isMobile ? "small" : "medium"}
      sx={{
        borderRadius: "20px",
        whiteSpace: "nowrap",
        ml: 2,
      }}
    >
      {isMobile ? "AI" : "AI Menu"}
    </Button>
  );
};

const AppContent: React.FC = () => {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState<boolean>(false);
  const { isDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Sidebar state
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
        fetchParkingSpots(),
        fetchParkingStatus(),
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

  React.useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(() => fetchParkingData(), 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  const handleSpotClick = useCallback((spot: ParkingSpotWithStatus) => {
    setMapCenter([
      parseFloat(spot.GPSLattitude),
      parseFloat(spot.GPSLongitude),
    ]);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="parking location"
              sx={{ mr: 2 }}
            >
              <MapPin size={24} />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" noWrap>
                Tel Aviv Parking Map
              </Typography>
              {!isMobile && (
                <Typography variant="caption" component="p" noWrap>
                  Find available parking spots in the city
                </Typography>
              )}
            </Box>

            <ThemeToggle />
            <AIButton onClick={handleOpenAIPopup} />
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 7, sm: 8, md: 9 },
            display: "flex",
            height: "calc(100vh - 64px)",
          }}
        >
          {/* Sidebar Component */}
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
              statusError={statusError}
              lastUpdated={lastUpdated}
              onRefresh={() => fetchParkingData(true)}
              isRefreshing={refreshing}
              toggleDrawer={toggleSidebar}
              isMobile={isMobile}
            />
          </Drawer>

          {/* Map Container */}
          <Box
            sx={{
              flexGrow: 1,
              position: "relative",
              // ml: isSidebarOpen && !isMobile ? `${drawerWidth}px` : 0,
              transition: theme.transitions.create(["margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            {/* Toggle sidebar button when collapsed */}
            <Fade in={!isSidebarOpen}>
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  position: "absolute",
                  left: 20,
                  top: 20,
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
              />
            </Suspense>
          </Box>
        </Box>
      </Box>

      {/* AI Dialog as a drawer on mobile, modal on desktop */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={isAIPopupOpen}
          onClose={handleCloseAIPopup}
          PaperProps={{
            sx: {
              maxHeight: "80vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              px: 2,
              py: 3,
            },
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <AIPopup isOpen={isAIPopupOpen} onClose={handleCloseAIPopup} />
          </Suspense>
        </Drawer>
      ) : (
        isAIPopupOpen && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => {
              // Close when clicking overlay but not when clicking the dialog
              if (e.target === e.currentTarget) handleCloseAIPopup();
            }}
          >
            <Suspense
              fallback={
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              }
            >
              <AIPopup isOpen={isAIPopupOpen} onClose={handleCloseAIPopup} />
            </Suspense>
          </Box>
        )
      )}
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;
