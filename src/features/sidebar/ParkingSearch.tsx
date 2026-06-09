import React from "react";
import { Box, InputBase, alpha, IconButton } from "@mui/material";
import { Search, X } from "lucide-react";

interface ParkingSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ParkingSearch: React.FC<ParkingSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.8,
        borderRadius: "10px",
        backgroundColor: (theme) =>
          alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.08),
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        color: "primary.main",
        transition: "all 0.2s ease",
        "&:focus-within": {
          backgroundColor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.1),
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.36),
          boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      <Search size={17} color="currentColor" style={{ opacity: 0.62, flexShrink: 0 }} />
      <InputBase
        fullWidth
        placeholder="Search parking"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          fontSize: "0.84rem",
          fontWeight: 650,
          color: "text.primary",
          "& input": {
            padding: 0,
            "&::placeholder": {
              color: "primary.main",
              opacity: 0.72,
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
