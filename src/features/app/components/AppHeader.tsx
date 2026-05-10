import React, { useState } from "react";
import { Car, Star, Bell, Settings, Menu } from "lucide-react";
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
} from "@mui/material";
import { useThemeStore } from "../../../stores/themeStore";
import { useFavoritesStore } from "../../../stores/favoritesStore";
import { useNotificationStore } from "../../../stores/notificationStore";
import ThemeToggle from "../../../components/Theme/ThemeToggle";
import OptionButton from "../../options/OptionButton";
import { NotificationBadge, NotificationPanel } from "../../notifications";
import { AppHeaderProps } from "../../../Types/app";
import { motion } from "framer-motion";

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenOptionPopup }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const { favoritesCount } = useFavoritesStore();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: (theme) =>
          alpha(theme.palette.background.default, 0.85),
        borderBottom: (theme) =>
          `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        zIndex: (theme) => theme.zIndex.appBar,
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
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: (theme) =>
                  `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              <Car size={isSmallMobile ? 20 : 24} color="white" strokeWidth={2.5} />
            </Box>
          </motion.div>

          <Box>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                color: "text.primary",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {isSmallMobile ? "ParkAI" : "ParkingParkAI"}
            </Typography>
            {!isSmallMobile && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                Tel Aviv Smart Parking
              </Typography>
            )}
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Status Badge - Only on larger screens */}
        {!isMobile && (
          <Chip
            label="Live"
            size="small"
            sx={{
              height: 24,
              backgroundColor: (theme) => alpha(theme.palette.success.main, 0.15),
              color: "success.main",
              fontWeight: 600,
              fontSize: "0.7rem",
              "& .MuiChip-label": {
                px: 1,
              },
              "&::before": {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "success.main",
                marginRight: 6,
                animation: "pulse 2s ease-in-out infinite",
              },
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.5 },
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
                  color: "warning.main",
                  backgroundColor: (theme) =>
                    alpha(theme.palette.warning.main, 0.1),
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.warning.main, 0.2),
                  },
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
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
        onNavigateToSpot={(spotId) => {
          console.log("Navigate to spot:", spotId);
        }}
      />
    </AppBar>
  );
};

export default AppHeader;
