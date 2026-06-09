import React from "react";
import { Box, Typography, IconButton, alpha } from "@mui/material";
import { X, ParkingCircle } from "lucide-react";

interface SidebarHeaderProps {
  toggleDrawer: () => void;
  isMobile: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ toggleDrawer, isMobile }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2,
        py: isMobile ? 1.25 : 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
        <Box
          sx={{
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            borderRadius: "10px",
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: (theme) => `0 10px 22px ${alpha(theme.palette.primary.main, 0.22)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <ParkingCircle size={isMobile ? 17 : 20} color="inherit" />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
            fontWeight: 800,
            fontSize: isMobile ? "0.98rem" : "1rem",
            lineHeight: 1.2,
            color: "text.primary",
            letterSpacing: 0,
          }}
        >
            Find Parking
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: (theme) => alpha(theme.palette.primary.main, 0.72),
              fontSize: "0.72rem",
              fontWeight: 650,
            }}
          >
            Live availability
          </Typography>
        </Box>
      </Box>
      {!isMobile && (
        <IconButton
          onClick={toggleDrawer}
          size="small"
          aria-label="Close sidebar"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            backgroundColor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.1),
            color: "primary.main",
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.16),
              color: "primary.main",
            },
          }}
        >
          <X size={16} />
        </IconButton>
      )}
    </Box>
  );
};

export default SidebarHeader;
