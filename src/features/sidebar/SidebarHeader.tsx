import React from "react";
import { Box, Typography, IconButton, alpha } from "@mui/material";
import { X, Car, Sparkles } from "lucide-react";

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
        py: 2.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Car size={20} color="inherit" />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.2,
              color: "text.primary",
            }}
          >
            Find Parking
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            Real-time availability
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
            backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.5),
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.8),
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
