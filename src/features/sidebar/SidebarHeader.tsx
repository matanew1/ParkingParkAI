import React from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  toggleDrawer: () => void;
  isMobile: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ toggleDrawer, isMobile }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6">Parking Spots</Typography>
      {isMobile && (
        <IconButton onClick={toggleDrawer} aria-label="Close sidebar">
          <X size={20} />
        </IconButton>
      )}
    </Box>
  );
};

export default SidebarHeader;