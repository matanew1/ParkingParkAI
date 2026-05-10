import React from "react";
import { Box, InputBase, alpha, useMediaQuery, IconButton } from "@mui/material";
import { Search, X } from "lucide-react";

interface ParkingSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ParkingSearch: React.FC<ParkingSearchProps> = ({ searchTerm, setSearchTerm }) => {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: 3,
        backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.5),
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: "all 0.2s ease",
        "&:focus-within": {
          backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.8),
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
          boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      <Search size={18} color="inherit" style={{ opacity: 0.5, flexShrink: 0 }} />
      <InputBase
        fullWidth
        placeholder="Search by name or address..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          fontSize: "0.875rem",
          fontWeight: 500,
          "& input": {
            padding: 0,
            "&::placeholder": {
              opacity: 0.6,
            },
          },
        }}
      />
      {searchTerm && (
        <IconButton
          size="small"
          onClick={() => setSearchTerm("")}
          sx={{
            width: 24,
            height: 24,
            opacity: 0.5,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <X size={14} />
        </IconButton>
      )}
    </Box>
  );
};

export default ParkingSearch;
