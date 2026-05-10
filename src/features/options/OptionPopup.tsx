import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Switch,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  X,
  Route,
  MapPin,
  Navigation,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useParkingStore } from "../../stores/parkingStore";
import type { OptionPopupProps } from "../../Types/opt";
import type { Coordinates } from "../../Services/routeService";

const OptionPopup: React.FC<OptionPopupProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();

  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [needsDestination, setNeedsDestination] = useState(false);
  const [routeDetails, setRouteDetails] = useState<{ distance: string; duration: string } | null>(null);
  const [routePreferences, setRoutePreferences] = useState({
    avoidTolls: false,
    avoidHighways: false,
    shortest: false,
  });

  const { userLocation, selectedSpot, setShowLocationMarker, fetchUserLocation, fetchRoute } =
    useParkingStore();

  const processRouteRequest = useCallback(
    async (source: Coordinates, destination: string) => {
      setLocationStatus("Calculating your optimal route...");
      try {
        await fetchRoute(source, destination);
        setRouteDetails({ distance: "See map", duration: "Route shown" });
        setLocationStatus("Route ready! Check the map.");
        setLoadingAction(false);
        setNeedsDestination(false);
      } catch {
        setLocationStatus("Route calculation failed. Please try again.");
        setLoadingAction(false);
      }
    },
    [fetchRoute]
  );

  const handleAIAction = useCallback(
    (optionId: string) => {
      setActiveOption(optionId);
      setLoadingAction(true);
      setLocationStatus("Locating you...");

      if (optionId === "route") {
        if (!selectedSpot) {
          setLocationStatus("Please pick a parking spot on the map first.");
          setNeedsDestination(true);
          setLoadingAction(false);
        } else if (!userLocation && navigator.geolocation) {
          setShowLocationMarker(true);
          fetchUserLocation()
            .then(() => {
              const currentLocation = useParkingStore.getState().userLocation;
              if (!currentLocation) {
                setLocationStatus("Location access denied. Please enable it.");
                setLoadingAction(false);
                return;
              }
              const dest = useParkingStore.getState().selectedSpot;
              if (!dest) {
                setLocationStatus("Please pick a parking spot on the map first.");
                setNeedsDestination(true);
                setLoadingAction(false);
              } else {
                processRouteRequest(currentLocation, dest);
              }
            })
            .catch(() => {
              setLocationStatus("Location access denied. Please enable it.");
              setLoadingAction(false);
            });
        } else if (userLocation && selectedSpot) {
          processRouteRequest(userLocation, selectedSpot);
        }
      }
    },
    [userLocation, selectedSpot, processRouteRequest, setShowLocationMarker, fetchUserLocation]
  );

  useEffect(() => {
    if (needsDestination && selectedSpot && userLocation) {
      setLoadingAction(true);
      processRouteRequest(userLocation, selectedSpot);
    }
  }, [needsDestination, selectedSpot, userLocation, processRouteRequest]);

  if (!isOpen) return null;

  const headerGradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: headerGradient,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={20} color="white" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Options
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enhance your parking experience
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
        {activeOption ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Active option title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Route size={20} color={theme.palette.primary.main} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Optimal Route
              </Typography>
            </Box>

            {/* Route preferences (when not loading or waiting for spot) */}
            {!loadingAction && !needsDestination && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Route Preferences
                </Typography>
                <FormGroup>
                  {[
                    { key: "shortest", label: "Prefer shortest distance" },
                    { key: "avoidHighways", label: "Avoid highways" },
                    { key: "avoidTolls", label: "Avoid toll roads" },
                  ].map(({ key, label }) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Switch
                          size="small"
                          checked={routePreferences[key as keyof typeof routePreferences]}
                          onChange={(e) =>
                            setRoutePreferences((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          {label}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  disabled={!userLocation || !selectedSpot}
                  onClick={() => {
                    if (userLocation && selectedSpot) {
                      setLoadingAction(true);
                      processRouteRequest(userLocation, selectedSpot);
                    }
                  }}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Apply & Recalculate
                </Button>
              </Box>
            )}

            {/* Status area */}
            {loadingAction ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 4,
                  gap: 2,
                }}
              >
                <CircularProgress size={40} thickness={3} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {locationStatus}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                {needsDestination ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 2 }}>
                    <MapPin size={36} color={theme.palette.error.main} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {locationStatus}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Navigation size={16} color={theme.palette.success.main} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Optimal Route
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      {locationStatus}
                    </Typography>
                    {routeDetails && (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1.5,
                          pt: 1.5,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                        }}
                      >
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1.5,
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.action.hover, 0.5),
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                            Distance
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {routeDetails.distance}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1.5,
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.action.hover, 0.5),
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                            Time
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {routeDetails.duration}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}

            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setActiveOption(null);
                setNeedsDestination(false);
                setLocationStatus("");
                setRouteDetails(null);
              }}
              sx={{ borderRadius: 2 }}
            >
              ← Back to Options
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
              Choose a feature to enhance your parking experience
            </Typography>

            {/* Route option button */}
            <Box
              onClick={() => handleAIAction("route")}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  flexShrink: 0,
                }}
              >
                <Route size={22} color={theme.palette.primary.main} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Optimal Route
                  </Typography>
                  <Chip label="AI" size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Find the best path to your selected parking spot with smart routing.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 1,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                startIcon={<HelpCircle size={16} />}
                color="inherit"
                sx={{ color: "text.secondary", fontSize: "0.8rem" }}
              >
                Need help with parking?
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="text.disabled">
          Powered by Matan Bardugo · Tel Aviv Parking Map
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(OptionPopup);
