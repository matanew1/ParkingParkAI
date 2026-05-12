import React, { lazy, Suspense, useCallback, useState } from "react";
import { Map, List, Zap, Bell } from "lucide-react";
import {
  Box,
  useMediaQuery,
  Drawer,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  alpha,
  Fab,
  Zoom,
  useTheme,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
} from "@mui/material";
import { useThemeStore } from "../../../stores/themeStore";
import { useParkingStore } from "../../../stores/parkingStore";
import { useNotificationStore } from "../../../stores/notificationStore";
import { lightTheme, darkTheme } from "../../../components/Theme/ThemeConfig";
import AppHeader from "./AppHeader";
import { Sidebar } from "../../sidebar";
import { OptionDialog } from "../../options";
import { LuckySpotWizard } from "../../wizard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import type { ParkingSpotWithStatus } from "../../../Types/parking";

const OptimizedParkingMap = lazy(() => import("../../map/OptimizedParkingMap"));

// Mobile bottom nav items
type MobileTab = "map" | "spots" | "lucky" | "alerts";

const AppContent: React.FC = () => {
  const [isOptionPopupOpen, setIsOptionPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const isMobile = useMediaQuery("(max-width:768px)");
  const isTablet = useMediaQuery("(max-width:1024px)");

  const { unreadCount } = useNotificationStore();

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

  const handleOpenOptionPopup = useCallback(() => setIsOptionPopupOpen(true), []);
  const handleCloseOptionPopup = useCallback(() => setIsOptionPopupOpen(false), []);

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

  const handleNavigateToSpot = useCallback(
    (spotId: string) => {
      const spot = parkingSpots.find((s) => s.code_achoza.toString() === spotId);
      if (spot) {
        setMapCenter([spot.lat, spot.lon]);
        setSelectedSpotId(spotId);
        setSelectedSpot(`${spot.lat},${spot.lon}`);
        if (isMobile) {
          setMobileTab("map");
          setIsSidebarOpen(false);
        }
      }
    },
    [parkingSpots, setMapCenter, setSelectedSpot, isMobile]
  );

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
      if (value === "alerts") {
        setNotificationPanelOpen(true);
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
  const BOTTOM_NAV_HEIGHT = 64;

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
        <AppHeader
          onOpenOptionPopup={handleOpenOptionPopup}
          onNavigateToSpot={handleNavigateToSpot}
          onOpenNotifications={() => setNotificationPanelOpen(true)}
          notificationPanelOpen={notificationPanelOpen}
          onCloseNotifications={() => setNotificationPanelOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: "56px", sm: "64px" },
            display: "flex",
            height: "100%",
            overflow: "hidden",
            position: "relative",
            pb: isMobile ? `${BOTTOM_NAV_HEIGHT}px` : 0,
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
                  top: { xs: "56px", sm: "64px" },
                  height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
                  borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
                  backgroundColor: (t) => alpha(t.palette.background.paper, 0.97),
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
                  height: "85vh",
                  borderRadius: "24px 24px 0 0",
                  backgroundColor: (t) => alpha(t.palette.background.paper, 0.98),
                  backdropFilter: "blur(20px)",
                  overflow: "hidden",
                  pb: `${BOTTOM_NAV_HEIGHT}px`,
                },
              }}
            >
              {/* Drag Handle */}
              <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 1 }}>
                <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "divider" }} />
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
                    boxShadow: (t) =>
                      `0 0 20px ${alpha(t.palette.primary.main, 0.5)}, 0 4px 20px ${alpha(t.palette.primary.main, 0.3)}`,
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
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1300,
              borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              backgroundColor: (t) => alpha(t.palette.background.paper, 0.95),
            }}
          >
            <BottomNavigation
              value={mobileTab}
              onChange={handleMobileTabChange}
              sx={{
                height: BOTTOM_NAV_HEIGHT,
                backgroundColor: "transparent",
                "& .MuiBottomNavigationAction-root": {
                  minWidth: 0,
                  color: "text.secondary",
                  transition: "all 0.2s ease",
                  "&.Mui-selected": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <BottomNavigationAction
                value="map"
                label="Map"
                icon={<Map size={22} />}
              />
              <BottomNavigationAction
                value="spots"
                label="Spots"
                icon={<List size={22} />}
              />
              {/* Lucky Spot — the unicorn feature with a glowing center button */}
              <BottomNavigationAction
                value="lucky"
                label="Lucky"
                icon={
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: -2,
                      boxShadow: "0 0 20px rgba(124,58,237,0.6), 0 4px 16px rgba(236,72,153,0.4)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 0 28px rgba(124,58,237,0.8), 0 6px 20px rgba(236,72,153,0.6)",
                      },
                    }}
                  >
                    <Zap size={22} color="#ffffff" />
                  </Box>
                }
                sx={{
                  "& .MuiBottomNavigationAction-label": {
                    color: "#ec4899",
                    fontWeight: 700,
                    fontSize: "0.65rem !important",
                  },
                }}
              />
              <BottomNavigationAction
                value="alerts"
                label="Alerts"
                icon={
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                  >
                    <Bell size={22} />
                  </Badge>
                }
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

        <OptionDialog isOpen={isOptionPopupOpen} onClose={handleCloseOptionPopup} />
      </Box>
    </MuiThemeProvider>
  );
};

export default React.memo(AppContent);
