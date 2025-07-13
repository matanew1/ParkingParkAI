import React from "react";
import { ParkingSpotWithStatus } from "../../types/parking";
import { ParkingListProps } from "../../types/parking";
import {
  List,
  ListItem,
  ListItemButton,
  Box,
  Typography,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import { ChevronRight, Clock } from "lucide-react";
import { useParkingStatus } from "../Hooks/useParkingStatus";

const ParkingList: React.FC<ParkingListProps> = ({
  filteredSpots,
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile,
}) => {
  if (filteredSpots.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="textSecondary">
          No parking spots match your search.
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {filteredSpots.map((spot) => (
        <ParkingSpotItem
          key={spot.code_achoza}
          spot={spot}
          onSpotClick={onSpotClick}
          onSpotSelect={onSpotSelect}
          toggleDrawer={toggleDrawer}
          isMobile={isMobile}
        />
      ))}
    </List>
  );
};

// Extract ParkingSpotItem as a separate component
const ParkingSpotItem = ({
  spot,
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    onSpotSelect(spot.code_achoza.toString());
    onSpotClick(spot);
    if (isMobile) toggleDrawer();
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'פנוי':
        return 'success';
      case 'מעט':
        return 'warning';
      case 'מלא':
        return 'error';
      case 'סגור':
        return 'error';
      case 'פעיל':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 1,
        overflow: "hidden",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <ListItemButton onClick={handleClick}>
        <ListItem disablePadding>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" noWrap>
                {spot.shem_chenyon}
              </Typography>
              <ChevronRight size={16} color={theme.palette.text.secondary} />
            </Box>
            <Typography variant="body2" color="textSecondary" noWrap>
              {spot.ktovet}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Chip
                label={spot.status_chenyon || 'Status unavailable'}
                size="small"
                color={getStatusColor(spot.status_chenyon)}
                sx={{ height: 24 }}
              />
              {spot.tr_status_chenyon && spot.tr_status_chenyon > 0 && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Clock size={12} />
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ ml: 0.5 }}
                  >
                    {new Date(
                      spot.tr_status_chenyon
                    ).toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </ListItem>
      </ListItemButton>
    </Paper>
  );
};

export default ParkingList;
