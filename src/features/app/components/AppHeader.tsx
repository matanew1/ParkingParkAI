import React, { useMemo } from "react";
import { Car, Circle } from "lucide-react";
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
import { motion } from "framer-motion";
import { useParkingStore } from "../../../stores/parkingStore";

const AppHeader: React.FC = () => {
  const isSmallMobile = useMediaQuery("(max-width:480px)");
  const theme = useTheme();

  const parkingSpots = useParkingStore((s) => s.parkingSpots);
  const availableCount = useMemo(
    () => parkingSpots.filter((s) => s.status_chenyon === "פנוי").length,
    [parkingSpots]
  );

  const headerBg =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.88)
      : alpha("#ffffff", 0.92);
  const headerBorder = alpha(theme.palette.divider, 0.16);
  const textPrimary = theme.palette.text.primary;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(24px) saturate(1.12)",
        WebkitBackdropFilter: "blur(24px) saturate(1.12)",
        backgroundColor: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 18px 44px ${alpha(theme.palette.common.black, 0.28)}`
            : `0 14px 34px ${alpha(theme.palette.common.black, 0.07)}`,
        zIndex: theme.zIndex.appBar,
        color: textPrimary,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 58, sm: 68 },
          px: { xs: 2, sm: 3 },
          gap: { xs: 1.25, sm: 1.75 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.15, minWidth: 0 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 46 },
                height: { xs: 40, sm: 46 },
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 14px 30px ${alpha(theme.palette.primary.main, 0.28)}`,
                flexShrink: 0,
              }}
            >
              <Car size={isSmallMobile ? 19 : 23} color="#ffffff" strokeWidth={2.5} />
            </Box>
          </motion.div>

          <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.4 }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 850,
                fontSize: { xs: "1.05rem", sm: "1.22rem" },
                color: textPrimary,
                letterSpacing: 0,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isSmallMobile ? "ParkAI" : "ParkAI"}
            </Typography>
            {availableCount > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.65,
                  color: theme.palette.success.main,
                  fontSize: { xs: "0.74rem", sm: "0.8rem" },
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    display: "flex",
                    color: "currentColor",
                    animation: "headerPulse 2s ease-in-out infinite",
                    "@keyframes headerPulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                    },
                  }}
                >
                  <Circle size={9} fill="currentColor" strokeWidth={0} />
                </Box>
                {availableCount} available now
              </Box>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Tel Aviv parking
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
