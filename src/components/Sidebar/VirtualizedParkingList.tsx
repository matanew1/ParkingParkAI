import React, { useMemo } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { ParkingSpotWithStatus } from "../../Types/parking";
import { ParkingListProps } from "../../Types/parking";
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

const VirtualizedParkingList: React.FC<ParkingListProps> = ({
  filteredSpots,
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Virtualize the list for better performance with large datasets
  const rowVirtualizer = useVirtualizer({
    count: filteredSpots.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each item
    overscan: 10, // Render 10 extra items outside viewport
  });

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
    <Box
      ref={parentRef}
      style={{
        height: '100%', // Use full height of parent container
        width: '100%',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const spot = filteredSpots[virtualItem.index];
          return (
            <ParkingSpotItem
              key={spot.UniqueId || `${spot.code_achoza}_${spot.oid_hof}`}
              spot={spot}
              onSpotClick={onSpotClick}
              onSpotSelect={onSpotSelect}
              toggleDrawer={toggleDrawer}
              isMobile={isMobile}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })}
      </div>
    </Box>
  );
};

// Extract ParkingSpotItem as a separate component
const ParkingSpotItem = React.memo<{
  spot: ParkingSpotWithStatus;
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  onSpotSelect: (spotId: string) => void;
  toggleDrawer: () => void;
  isMobile: boolean;
  style?: React.CSSProperties;
}>(({
  spot,
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile,
  style,
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
    <div style={style}>
      <Paper
        elevation={1}
        sx={{
          mb: 1,
          mx: 1,
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
    </div>
  );
});

ParkingSpotItem.displayName = 'ParkingSpotItem';

export default VirtualizedParkingList;
