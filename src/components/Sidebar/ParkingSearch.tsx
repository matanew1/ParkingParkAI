import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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
      margin="normal"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 2 }}
    />
  );
};

export default ParkingSearch;