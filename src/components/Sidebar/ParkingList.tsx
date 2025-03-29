import React from "react";
import { ParkingSpotWithStatus } from "../../types/parking";
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

interface ParkingListProps {
  filteredSpots: ParkingSpotWithStatus[];
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  onSpotSelect: (spotId: string) => void;
  toggleDrawer: () => void;
  isMobile: boolean;
}

const ParkingList: React.FC<ParkingListProps> = ({
  filteredSpots,
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile,
}) => {
  const { handleSpotStatus } = useParkingStatus();

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
          key={spot.AhuzotCode}
          spot={spot}
          onSpotClick={onSpotClick}
          onSpotSelect={onSpotSelect}
          toggleDrawer={toggleDrawer}
          isMobile={isMobile}
          handleSpotStatus={handleSpotStatus}
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
  handleSpotStatus,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    onSpotSelect(spot.AhuzotCode);
    onSpotClick(spot);
    if (isMobile) toggleDrawer();
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
                {spot.Name}
              </Typography>
              <ChevronRight size={16} color={theme.palette.text.secondary} />
            </Box>
            <Typography variant="body2" color="textSecondary" noWrap>
              {spot.Address}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Chip
                label={handleSpotStatus(spot)}
                size="small"
                color={handleSpotStatus(spot) === "מלא" ? "error" : "success"}
                sx={{ height: 24 }}
              />
              {spot.status && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Clock size={12} />
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ ml: 0.5 }}
                  >
                    {new Date(
                      spot.status.LastUpdateFromDambach
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
