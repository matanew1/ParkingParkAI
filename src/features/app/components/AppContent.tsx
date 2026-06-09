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
              bottom: "max(10px, env(safe-area-inset-bottom))",
              left: "50%",
              width: "min(340px, calc(100% - 32px))",
              transform: "translateX(-50%)",
              zIndex: 1300,
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.16)}`,
              borderRadius: "16px",
              overflow: "visible",
              backdropFilter: "blur(24px) saturate(1.12)",
              WebkitBackdropFilter: "blur(24px) saturate(1.12)",
              backgroundColor: (t) =>
                alpha(t.palette.background.paper, t.palette.mode === "dark" ? 0.9 : 0.92),
              boxShadow: (t) =>
                `0 14px 34px ${alpha(
                  t.palette.common.black,
                  t.palette.mode === "dark" ? 0.34 : 0.16
                )}`,
            }}
          >
            <BottomNavigation
              value={mobileTab}
              onChange={handleMobileTabChange}
              sx={{
                height: BOTTOM_NAV_HEIGHT,
                backgroundColor: "transparent",
                px: 0.65,
                "& .MuiBottomNavigationAction-root": {
                  minWidth: 0,
                  px: 0.5,
                  color: (t) => alpha(t.palette.primary.main, 0.7),
                  borderRadius: "12px",
                  transition:
                    "background-color 0.18s ease, color 0.18s ease, transform 0.18s ease",
                  "&.Mui-selected": {
                    color: "primary.main",
                    backgroundColor: (t) => alpha(t.palette.primary.main, 0.09),
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                },
                "& .MuiBottomNavigationAction-label": {
                  fontWeight: 750,
                  fontSize: "0.66rem",
                  mt: 0.2,
                },
              }}
            >
              <BottomNavigationAction
                value="map"
                label="Map"
                icon={<MapPinned size={20} strokeWidth={2.2} />}
              />
              <BottomNavigationAction
                value="lucky"
                label="Best"
                icon={
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: -2.4,
                      border: (t) => `3px solid ${alpha(t.palette.background.paper, 0.96)}`,
                      boxShadow: (t) =>
                        `0 12px 28px ${alpha(t.palette.primary.main, 0.34)}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-1px) scale(1.04)",
                        boxShadow: (t) =>
                          `0 15px 32px ${alpha(t.palette.primary.main, 0.4)}`,
                      },
                    }}
                  >
                    <Navigation2 size={21} color="#ffffff" strokeWidth={2.6} />
                  </Box>
                }
                sx={{
                  "& .MuiBottomNavigationAction-label": {
                    color: "primary.main",
                    fontWeight: 800,
                    fontSize: "0.62rem !important",
                  },
                }}
              />
              <BottomNavigationAction
                value="spots"
                label="Spots"
                icon={<ParkingCircle size={20} strokeWidth={2.2} />}
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
