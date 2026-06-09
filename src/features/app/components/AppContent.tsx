import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { List, MapPinned, Navigation2, ParkingCircle } from "lucide-react";
import {
  Box,
  useMediaQuery,
  Drawer,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  alpha,
  Fab,
  Zoom,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import { useThemeStore } from "../../../stores/themeStore";
import { useParkingStore } from "../../../stores/parkingStore";
import { lightTheme, darkTheme } from "../../../components/Theme/ThemeConfig";
import AppHeader from "./AppHeader";
import { Sidebar } from "../../sidebar";
import { LuckySpotWizard } from "../../wizard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import type { ParkingSpotWithStatus } from "../../../Types/parking";

const OptimizedParkingMap = lazy(() => import("../../map/OptimizedParkingMap"));

// Mobile bottom nav items
type MobileTab = "map" | "spots" | "lucky";

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const [wizardOpen, setWizardOpen] = useState(false);

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  // Trigger initial parking data fetch on component mount
  useEffect(() => {
    if (!lastUpdated && !error && loading) {
      // Only fetch if we haven't already and we're still in loading state
      fetchParkingData();
    }
  }, []); // Only run once on mount

  const isMobile = useMediaQuery("(max-width:768px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

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

  const handleResetMapApp = useCallback(() => {
    setSelectedSpotId(null);
    setSelectedSpot(null);
    handleResetMap();
  }, [setSelectedSpot, handleResetMap]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSpotClick = useCallback(
    (spot: ParkingSpotWithStatus) => {
      setSelectedSpotId(spot.code_achoza.toString());
      setSelectedSpot(`${spot.lat},${spot.lon}`);
      if (isMobile) {
        setMobileTab("map");
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
        setMobileTab("map");
        setIsSidebarOpen(false);
      }
    },
    [setMapCenter, setSelectedSpot, isMobile]
  );

  const handleSpotSelect = useCallback((spotId: string | null) => {
    setSelectedSpotId(spotId);
  }, []);

  // Lucky Spot wizard handler — selects spot and opens route on map
  const handleWizardSpotSelected = useCallback(
    (spot: ParkingSpotWithStatus) => {
      handleSpotSelectFromSidebar(spot);
    },
    [handleSpotSelectFromSidebar]
  );

  // Mobile bottom nav tab change
  const handleMobileTabChange = useCallback(
    (_: React.SyntheticEvent, value: MobileTab) => {
      if (value === "lucky") {
        setWizardOpen(true);
        return;
      }
      setMobileTab(value);
      if (value === "spots") {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    },
    []
  );

  // Bottom nav safe area padding (iOS home bar)
  const BOTTOM_NAV_HEIGHT = 58;

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
        <AppHeader />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: "58px", sm: "68px" },
            display: "flex",
            height: "100%",
            overflow: "hidden",
            position: "relative",
            pb: isMobile
              ? `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 22px)`
              : 0,
            backgroundColor: "background.default",
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
                  top: { xs: "58px", sm: "68px" },
                  height: { xs: "calc(100% - 58px)", sm: "calc(100% - 68px)" },
                  borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
                  backgroundColor: (t) =>
                    alpha(t.palette.background.paper, t.palette.mode === "dark" ? 0.92 : 0.96),
                  backdropFilter: "blur(22px) saturate(1.08)",
                  WebkitBackdropFilter: "blur(22px) saturate(1.08)",
                  boxShadow: (t) =>
                    `18px 0 38px ${alpha(
                      t.palette.common.black,
                      t.palette.mode === "dark" ? 0.28 : 0.08
                    )}`,
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
                isMobile={false}
              />
            </Drawer>
          )}

          {/* Mobile Bottom Sheet for Spots */}
          {isMobile && (
            <SwipeableDrawer
              anchor="bottom"
              open={isSidebarOpen}
              onClose={() => { setIsSidebarOpen(false); setMobileTab("map"); }}
              onOpen={() => { setIsSidebarOpen(true); setMobileTab("spots"); }}
              disableSwipeToOpen={false}
              swipeAreaWidth={20}
              ModalProps={{ keepMounted: true }}
              PaperProps={{
                sx: {
                  height: { xs: "76vh", sm: "72vh" },
                  borderRadius: "12px 12px 0 0",
                  backgroundColor: (t) =>
                    alpha(t.palette.background.paper, t.palette.mode === "dark" ? 0.94 : 0.98),
                  backdropFilter: "blur(22px) saturate(1.08)",
                  WebkitBackdropFilter: "blur(22px) saturate(1.08)",
                  borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.14)}`,
                  boxShadow: (t) =>
                    `0 -22px 50px ${alpha(
                      t.palette.common.black,
                      t.palette.mode === "dark" ? 0.38 : 0.16
                    )}`,
                  overflow: "hidden",
                  pb: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 10px)`,
                },
              }}
            >
              {/* Drag Handle */}
              <Box sx={{ display: "flex", justifyContent: "center", pt: 1, pb: 0.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.22),
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
                toggleDrawer={() => { setIsSidebarOpen(false); setMobileTab("map"); }}
                isMobile={true}
              />
            </SwipeableDrawer>
          )}

          {/* Map Container */}
          <Box
              sx={{
                flexGrow: 1,
                position: "relative",
                height: "100%",
                transition: "margin 0.3s ease",
                backgroundColor: "background.default",
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
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    color: (t) => t.palette.primary.main,
                    backgroundColor: (t) => alpha(t.palette.background.paper, 0.9),
                    border: (t) => `1px solid ${alpha(t.palette.divider, 0.18)}`,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: (t) =>
                      `0 14px 34px ${alpha(t.palette.common.black, t.palette.mode === "dark" ? 0.32 : 0.14)}`,
                    "&:hover": {
                      backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                    },
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

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <Paper
            elevation={0}
            sx={{
              position: "fixed",
              bottom: "max(12px, env(safe-area-inset-bottom))",
              left: "50%",
              width: "min(360px, calc(100% - 28px))",
              transform: "translateX(-50%)",
              zIndex: 1300,
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.18)}`,
              borderRadius: "18px",
              overflow: "visible",
              backdropFilter: "blur(28px) saturate(1.2)",
              WebkitBackdropFilter: "blur(28px) saturate(1.2)",
              backgroundColor: (t) =>
                alpha(t.palette.background.paper, t.palette.mode === "dark" ? 0.88 : 0.90),
              boxShadow: (t) =>
                `0 16px 40px ${alpha(
                  t.palette.common.black,
                  t.palette.mode === "dark" ? 0.36 : 0.18
                )}, 0 0 1px ${alpha(t.palette.primary.main, 0.1)}`,
            }}
          >
            <BottomNavigation
              value={mobileTab}
              onChange={handleMobileTabChange}
              sx={{
                height: BOTTOM_NAV_HEIGHT,
                backgroundColor: "transparent",
                px: 1.2,
                py: 0.6,
                display: "flex",
                justifyContent: "center",
                gap: 1.4,
                "& .MuiBottomNavigationAction-root": {
                  minWidth: 0,
                  padding: 0,
                  color: (t) => alpha(t.palette.text.secondary, 0.5),
                  borderRadius: "12px",
                  transition: "all 0.24s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "12px",
                    background: "transparent",
                    transition: "background 0.24s ease",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    "& svg": {
                      animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    },
                    "&::before": {
                      background: (t) => alpha(t.palette.primary.main, 0.12),
                    },
                  },
                  "&:active": {
                    transform: "scale(0.94)",
                  },
                  "&:hover:not(.Mui-selected)": {
                    color: (t) => alpha(t.palette.primary.main, 0.8),
                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.04),
                  },
                },
                "& .MuiBottomNavigationAction-label": {
                  display: "none",
                },
                "@keyframes popIn": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.2)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <BottomNavigationAction
                value="map"
                icon={<MapPinned size={24} strokeWidth={2} />}
              />
              <BottomNavigationAction
                value="lucky"
                icon={
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: -2.8,
                      border: (t) => `2.5px solid ${alpha(t.palette.background.paper, 0.98)}`,
                      boxShadow: (t) =>
                        `0 10px 28px ${alpha(t.palette.primary.main, 0.3)}, 0 0 1px ${alpha(t.palette.primary.main, 0.2)}`,
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: "-3px",
                        borderRadius: "50%",
                        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                      },
                      "&:hover": {
                        transform: "translateY(-2px) scale(1.08)",
                        boxShadow: (t) =>
                          `0 14px 36px ${alpha(t.palette.primary.main, 0.4)}, 0 0 1px ${alpha(t.palette.primary.main, 0.3)}`,
                        "&::after": {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Navigation2 size={23} color="#ffffff" strokeWidth={2.4} />
                  </Box>
                }
              />
              <BottomNavigationAction
                value="spots"
                icon={<ParkingCircle size={24} strokeWidth={2} />}
              />
            </BottomNavigation>
          </Paper>
        )}

        {/* Lucky Spot Wizard */}
        <LuckySpotWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSpotSelected={handleWizardSpotSelected}
        />
      </Box>
    </MuiThemeProvider>
  );
};

export default React.memo(AppContent);
