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
  alpha,
  Avatar,
} from "@mui/material";
import { ChevronRight, Clock, MapPin, Car } from "lucide-react";
import { getStatusColor } from "../../utils/colorUtils";

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
    estimateSize: () => isMobile ? 100 : 120, // Smaller on mobile
    overscan: 10, // Render 10 extra items outside viewport
  });

  if (filteredSpots.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          py: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3 },
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.3),
          border: (theme) => `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
          borderRadius: 2,
        }}
      >
        <Car size={isMobile ? 36 : 48} style={{ opacity: 0.3, marginBottom: isMobile ? 12 : 16 }} />
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          color="text.secondary" 
          sx={{ 
            mb: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          No parking spots match your search.
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Try adjusting your search terms
        </Typography>
      </Paper>
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'פנוי':
        return '🟢';
      case 'מעט':
        return '🟡';
      case 'מלא':
        return '🔴';
      case 'סגור':
        return '⚫';
      default:
        return '🔵';
    }
  };

  return (
    <div style={style}>
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 1, sm: 1.5 },
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          background: (theme) => alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          "&:hover": {
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            transform: isMobile ? "translateY(-2px)" : "translateY(-4px)",
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        <ListItemButton 
          onClick={handleClick}
          sx={{
            p: { xs: 1.5, sm: 2, md: 2.5 },
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            <Avatar
              sx={{
                width: { xs: 36, sm: 44, md: 48 },
                height: { xs: 36, sm: 44, md: 48 },
                mr: { xs: 1.5, sm: 2 },
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <MapPin size={isMobile ? 18 : 24} color={theme.palette.primary.main} />
            </Avatar>
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: { xs: 0.25, sm: 0.5 },
                }}
              >
                <Typography 
                  variant={isMobile ? "body1" : "subtitle1"} 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                  noWrap
                >
                  {spot.shem_chenyon}
                </Typography>
                <ChevronRight size={isMobile ? 16 : 20} color={theme.palette.action.active} />
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 1, sm: 1.5 }, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
                noWrap
              >
                {spot.ktovet}
              </Typography>
              
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.5, sm: 1 },
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  icon={<span style={{ fontSize: isMobile ? '10px' : '12px' }}>{getStatusIcon(spot.status_chenyon)}</span>}
                  label={spot.status_chenyon || 'Status unavailable'}
                  size="small"
                  color={getStatusColor(spot.status_chenyon)}
                  sx={{ 
                    height: { xs: 24, sm: 28 },
                    fontWeight: 600,
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    '& .MuiChip-icon': {
                      fontSize: isMobile ? '10px' : '12px',
                    },
                  }}
                />
                
                {spot.tr_status_chenyon && spot.tr_status_chenyon > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", ml: 'auto' }}>
                    <Clock size={isMobile ? 12 : 14} color={theme.palette.text.secondary} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        ml: 0.5, 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    >
                      {new Date(
                        spot.tr_status_chenyon
                      ).toLocaleTimeString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </ListItemButton>
      </Paper>
    </div>
  );
});

ParkingSpotItem.displayName = 'ParkingSpotItem';

export default VirtualizedParkingList;