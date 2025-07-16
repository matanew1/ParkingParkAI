import React from "react";
import { TextField, InputAdornment, alpha } from "@mui/material";
import { Search } from "lucide-react";

interface ParkingSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ParkingSearch: React.FC<ParkingSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search parking spots..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={18} />
          </InputAdornment>
        ),
      }}
      sx={{ 
        '& .MuiOutlinedInput-root': {
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
          borderRadius: 3,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
          },
          '&.Mui-focused': {
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
            boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
        },
        '& .MuiOutlinedInput-input': {
          fontWeight: 500,
        },
      }}
    />
  );
};

export default ParkingSearch;