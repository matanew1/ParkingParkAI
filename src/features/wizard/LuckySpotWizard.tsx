import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  Fade,
  Slide,
  Avatar,
} from "@mui/material";
import { X, Zap, Navigation, MapPin, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParkingStore } from "../../stores/parkingStore";
import type { ParkingSpotWithStatus } from "../../Types/parking";

// ---------------------------------------------------------------------------
// Haversine distance utility
// ---------------------------------------------------------------------------
const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LuckySpotWizardProps {
  open: boolean;
  onClose: () => void;
  onSpotSelected: (spot: ParkingSpotWithStatus) => void;
}

type Phase = "idle" | "scanning" | "results" | "done";

interface SpotWithDistance {
  spot: ParkingSpotWithStatus;
  distanceKm: number;
}

// ---------------------------------------------------------------------------
// Scanning animation: pulsing radar rings
// ---------------------------------------------------------------------------
const radarKeyframes = `
  @keyframes radarPulse {
    0%   { transform: scale(0.4); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;

function RadarRing({
  delay,
  color,
}: {
  delay: number;
  color: string;
}): React.ReactElement {
  return (
    <Box
      sx={{
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        animation: `radarPulse 1.8s ease-out ${delay}s infinite`,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Scanning phase content
// ---------------------------------------------------------------------------
function ScanningContent(): React.ReactElement {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <>
      <style>{radarKeyframes}</style>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 5,
          gap: 3,
        }}
      >
        {/* Radar container */}
        <Box
          sx={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RadarRing delay={0} color={primaryColor} />
          <RadarRing delay={0.6} color={primaryColor} />
          <RadarRing delay={1.2} color={primaryColor} />

          {/* Central circle */}
          <Box
            component={motion.div}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              position: "relative",
              zIndex: 1,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 14px 34px ${alpha(theme.palette.primary.main, 0.34)}`,
            }}
          >
            <Zap size={28} color="#ffffff" />
          </Box>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Finding your lucky spot...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyzing 1000+ spots nearby
          </Typography>
        </Box>

        <CircularProgress
          size={20}
          thickness={5}
          sx={{ color: primaryColor }}
        />
      </Box>
    </>
  );
}

// ---------------------------------------------------------------------------
// Result card
// ---------------------------------------------------------------------------
interface ResultCardProps {
  spotWithDist: SpotWithDistance;
  index: number;
  onSelect: (spot: ParkingSpotWithStatus) => void;
}

function ResultCard({
  spotWithDist,
  index,
  onSelect,
}: ResultCardProps): React.ReactElement {
  const theme = useTheme();
  const { spot, distanceKm } = spotWithDist;

  const walkingMinutes = Math.round(distanceKm / 0.083);
  const distanceLabel =
    distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} m`
      : `${distanceKm.toFixed(1)} km`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          background: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.12 : 0.08),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Rank badge */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background:
              index === 0
                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                : alpha(theme.palette.success.main, 0.15),
            color: index === 0 ? "#ffffff" : theme.palette.success.main,
            fontSize: 14,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {index === 0 ? <Star size={16} /> : `#${index + 1}`}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ flex: 1 }}
            >
              {spot.shem_chenyon || "Parking Lot"}
            </Typography>
            <Chip
              label={distanceLabel}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 11,
                height: 22,
                bgcolor: alpha(theme.palette.success.main, 0.15),
                color: theme.palette.success.main,
                border: "none",
                flexShrink: 0,
              }}
            />
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
              }}
            >
              <MapPin size={11} />
              <Typography variant="caption" noWrap>
                {spot.ktovet || "Tel Aviv"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
              }}
            >
              <Clock size={11} />
              <Typography variant="caption">
                ~{walkingMinutes} min walk
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            endIcon={<Navigation size={14} />}
            onClick={() => onSelect(spot)}
            sx={{
              borderRadius: "10px",
              fontSize: 12,
              py: 0.5,
              px: 1.5,
              fontWeight: 700,
            }}
          >
            Take me there
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Results phase content
// ---------------------------------------------------------------------------
interface ResultsContentProps {
  spots: SpotWithDistance[];
  onSelect: (spot: ParkingSpotWithStatus) => void;
}

function ResultsContent({
  spots,
  onSelect,
}: ResultsContentProps): React.ReactElement {
  if (spots.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No available spots found nearby.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" fontWeight={750} gutterBottom>
          Lucky Spot Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nearest available parking
        </Typography>
      </Box>

      {/* Cards */}
      {spots.map((swd, idx) => (
        <ResultCard
          key={swd.spot.UniqueId ?? idx}
          spotWithDist={swd}
          index={idx}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Done phase content
// ---------------------------------------------------------------------------
function DoneContent({
  spot,
}: {
  spot: ParkingSpotWithStatus;
}): React.ReactElement {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 5,
        gap: 2,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: alpha(theme.palette.success.main, 0.15),
            border: `3px solid ${theme.palette.success.main}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 16px 38px ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <Navigation size={32} color={theme.palette.success.main} />
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Typography variant="h6" fontWeight={750} textAlign="center">
          Navigating to{" "}
          <Box component="span" sx={{ color: "success.main" }}>
            {spot.shem_chenyon || "your spot"}
          </Box>
          !
        </Typography>
      </motion.div>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function LuckySpotWizardInner({
  open,
  onClose,
  onSpotSelected,
}: LuckySpotWizardProps): React.ReactElement | null {
  const theme = useTheme();
  const [phase, setPhase] = useState<Phase>("idle");
  const [nearbySpots, setNearbySpots] = useState<SpotWithDistance[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<ParkingSpotWithStatus | null>(null);

  const { parkingSpots, fetchUserLocation } = useParkingStore();

  // Start scanning when wizard opens
  useEffect(() => {
    if (!open) return;

    setPhase("scanning");
    setNearbySpots([]);
    setSelectedResult(null);

    // Kick off location fetch (non-blocking)
    fetchUserLocation();

    const timer = setTimeout(() => {
      const available = parkingSpots.filter(
        (s) => s.status_chenyon === "פנוי"
      );

      const userLoc = useParkingStore.getState().userLocation;

      let sorted: SpotWithDistance[];

      if (userLoc === null) {
        // Fallback: first 3 alphabetically by name
        sorted = available
          .slice()
          .sort((a, b) =>
            (a.shem_chenyon ?? "").localeCompare(b.shem_chenyon ?? "")
          )
          .slice(0, 3)
          .map((spot) => ({ spot, distanceKm: 0 }));
      } else {
        const [userLat, userLon] = userLoc;
        sorted = available
          .map((spot) => ({
            spot,
            distanceKm: haversineKm(userLat, userLon, spot.lat, spot.lon),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 3);
      }

      setNearbySpots(sorted);
      setPhase("results");
    }, 1200);

    return () => clearTimeout(timer);
  }, [open, parkingSpots, fetchUserLocation]);

  const handleSelectSpot = useCallback(
    (spot: ParkingSpotWithStatus) => {
      setSelectedResult(spot);
      setPhase("done");
      onSpotSelected(spot);

      const closeTimer = setTimeout(() => {
        onClose();
      }, 400);

      return () => clearTimeout(closeTimer);
    },
    [onSpotSelected, onClose]
  );

  if (!open && phase === "idle") return null;

  return (
    <Fade in={open} timeout={200}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.62 : 0.46),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Slide direction="up" in={open} timeout={300} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "85vh",
              overflowY: "auto",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              pb: { xs: 4, sm: 2 },
            }}
          >
            {/* Drag handle */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                pt: 1.5,
                pb: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.text.secondary, 0.28),
                }}
              />
            </Box>

            {/* Title bar */}
            <Box
              sx={{
                mx: 2,
                mb: 2,
                p: 2,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={18} color="#ffffff" />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    color="#ffffff"
                    lineHeight={1.2}
                  >
                    Lucky Spot
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    Best nearby match
                  </Typography>
                </Box>
              </Box>

              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: "10px",
                  bgcolor: "rgba(255,255,255,0.15)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
              >
                <X size={16} />
              </IconButton>
            </Box>

            {/* Phase content */}
            <Box sx={{ px: 2 }}>
              <AnimatePresence mode="wait">
                {phase === "scanning" && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ScanningContent />
                  </motion.div>
                )}

                {phase === "results" && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ResultsContent
                      spots={nearbySpots}
                      onSelect={handleSelectSpot}
                    />
                  </motion.div>
                )}

                {phase === "done" && selectedResult !== null && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DoneContent spot={selectedResult} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>

            {/* Footer hint */}
            {phase === "results" && nearbySpots.length > 0 && (
              <Box
                sx={{
                  mx: 2,
                  mt: 1,
                  p: 1.5,
                  borderRadius: "10px",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <MapPin size={14} color={theme.palette.primary.main} />
                <Typography variant="caption" color="text.secondary">
                  Spots sorted by walking distance from your location
                </Typography>
              </Box>
            )}
          </Paper>
        </Slide>
      </Box>
    </Fade>
  );
}

const LuckySpotWizard = React.memo(LuckySpotWizardInner);
export default LuckySpotWizard;
