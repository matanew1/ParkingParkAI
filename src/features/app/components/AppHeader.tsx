import React, { useState } from "react";
import { Car } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  alpha,
  useTheme,
} from "@mui/material";
import ThemeToggle from "../../../components/Theme/ThemeToggle";
import OptionButton from "../../options/OptionButton";
import { NotificationBadge, NotificationPanel } from "../../notifications";
import { AppHeaderProps } from "../../../Types/app";
import { motion } from "framer-motion";
import { useParkingStore } from "../../../stores/parkingStore";

const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenOptionPopup,
  onNavigateToSpot,
  onOpenNotifications,
  notificationPanelOpen: externalPanelOpen,
  onCloseNotifications,
}) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const [internalPanelOpen, setInternalPanelOpen] = useState(false);

  // Support both controlled (from parent) and uncontrolled modes
  const notificationPanelOpen = externalPanelOpen ?? internalPanelOpen;
  const openNotificationPanel = () => {
    onOpenNotifications ? onOpenNotifications() : setInternalPanelOpen(true);
  };
  const closeNotificationPanel = () => {
    onCloseNotifications ? onCloseNotifications() : setInternalPanelOpen(false);
  };
  const theme = useTheme();

  const parkingSpots = useParkingStore((s) => s.parkingSpots);
  const availableCount = parkingSpots.filter(
    (s) => s.status_chenyon === "פנוי"
  ).length;

  const headerBg =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.85)
      : alpha("#ffffff", 0.9);
  const headerBorder = alpha(theme.palette.divider, 0.12);
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
        zIndex: theme.zIndex.appBar,
        color: textPrimary,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.5, sm: 2.5 },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        {/* Logo & Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Box
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark, 0.85)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                flexShrink: 0,
              }}
            >
              <Car size={isSmallMobile ? 18 : 22} color="#ffffff" strokeWidth={2.5} />
            </Box>
          </motion.div>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1rem", sm: "1.15rem" },
                color: textPrimary,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isSmallMobile ? "ParkAI" : "ParkAI"}
            </Typography>
            {availableCount > 0 ? (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.success.main,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "currentColor",
                    display: "inline-block",
                    animation: "headerPulse 2s ease-in-out infinite",
                    "@keyframes headerPulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                    },
                  }}
                />
                {availableCount} available now
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: textSecondary,
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                Tel Aviv parking
              </Typography>
            )}
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons — keep this lean.
            Notifications live in the mobile bottom-nav so they're hidden here
            on mobile to avoid the duplicate bell that was on screen before. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.25, sm: 0.5 },
          }}
        >
          {!isMobile && (
            <NotificationBadge onClick={openNotificationPanel} size="medium" />
          )}
          <ThemeToggle />
          <OptionButton onClick={onOpenOptionPopup} />
        </Box>
      </Toolbar>

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationPanelOpen}
        onClose={closeNotificationPanel}
        onNavigateToSpot={onNavigateToSpot}
      />
    </AppBar>
  );
};

export default AppHeader;
