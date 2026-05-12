import React, { useState } from "react";
import { Car, Star } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  Badge,
  Tooltip,
  alpha,
  Chip,
  useTheme,
} from "@mui/material";
import { useFavoritesStore } from "../../../stores/favoritesStore";
import ThemeToggle from "../../../components/Theme/ThemeToggle";
import OptionButton from "../../options/OptionButton";
import { NotificationBadge, NotificationPanel } from "../../notifications";
import { AppHeaderProps } from "../../../Types/app";
import { motion } from "framer-motion";
import { useParkingStore } from "../../../stores/parkingStore";

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenOptionPopup, onNavigateToSpot }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const { favoritesCount } = useFavoritesStore();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const theme = useTheme();

  const parkingSpots = useParkingStore((s) => s.parkingSpots);
  const availableCount = parkingSpots.filter(
    (s) => s.status_chenyon === "פנוי"
  ).length;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha("#0d1117", 0.92)
            : alpha("#111827", 0.88),
        borderBottom: "none",
        zIndex: theme.zIndex.appBar,
        // Gradient accent line at the bottom
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          backgroundSize: "200% 100%",
          animation: "gradientShift 4s ease infinite",
        },
        "@keyframes gradientShift": {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 0%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, sm: 70 },
          px: { xs: 2, sm: 3 },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Logo & Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark, 0.8)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.6)}, 0 4px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
              }}
            >
              <Car size={isSmallMobile ? 20 : 24} color="#ffffff" strokeWidth={2.5} />
            </Box>
          </motion.div>

          <Box>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              {isSmallMobile ? "ParkAI" : "ParkingParkAI"}
            </Typography>
            {!isSmallMobile && (
              <Typography
                variant="caption"
                sx={{
                  color: alpha("#ffffff", 0.55),
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Tel Aviv Smart Parking
              </Typography>
            )}
          </Box>

          {/* Live available count chip */}
          {availableCount > 0 && !isSmallMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Chip
                label={`${availableCount} available`}
                size="small"
                sx={{
                  height: 22,
                  backgroundColor: alpha(theme.palette.success.main, 0.18),
                  color: theme.palette.success.main,
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
                  boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.25)}`,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </motion.div>
          )}
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Live indicator — desktop only */}
        {!isMobile && (
          <Chip
            label="Live"
            size="small"
            sx={{
              height: 24,
              backgroundColor: alpha(theme.palette.success.main, 0.15),
              color: theme.palette.success.main,
              fontWeight: 700,
              fontSize: "0.7rem",
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              "& .MuiChip-label": { px: 1 },
              "&::before": {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "currentColor",
                marginRight: "6px",
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              },
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
        )}

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {/* Notifications */}
          <NotificationBadge
            onClick={() => setNotificationPanelOpen(true)}
            size={isMobile ? "small" : "medium"}
          />

          {/* Favorites Badge */}
          {favoritesCount > 0 && (
            <Tooltip title={`${favoritesCount} saved spots`}>
              <IconButton
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: theme.palette.warning.main,
                  backgroundColor: alpha(theme.palette.warning.main, 0.12),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.warning.main, 0.22),
                    boxShadow: `0 0 12px ${alpha(theme.palette.warning.main, 0.4)}`,
                  },
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  transition: "all 0.2s ease",
                }}
              >
                <Badge
                  badgeContent={favoritesCount}
                  color="warning"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.65rem",
                      height: 16,
                      minWidth: 16,
                    },
                  }}
                >
                  <Star size={isMobile ? 18 : 20} fill="currentColor" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <ThemeToggle />
          <OptionButton onClick={onOpenOptionPopup} />
        </Box>
      </Toolbar>

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        onNavigateToSpot={onNavigateToSpot}
      />
    </AppBar>
  );
};

export default AppHeader;
