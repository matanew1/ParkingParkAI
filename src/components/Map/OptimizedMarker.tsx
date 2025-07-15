import React, { memo, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Paper, Chip, useMediaQuery, useTheme } from '@mui/material';
import { Clock } from 'lucide-react';
import { ParkingSpotWithStatus } from '../../Types/parking';
import { getMarkerIcon, selectedMarkerIcon } from './utils/MarkerUtils';
import { getStatusColor, getTypeColor } from '../../utils/colorUtils';
import { useAutoPopup } from '../../hooks/useAutoPopup';

interface OptimizedMarkerProps {
  spot: ParkingSpotWithStatus;
  isSelected: boolean;
  onSpotClick?: (spot: ParkingSpotWithStatus) => void;
  zoomLevel: number;
  showDetails: boolean;
  forceShowPopup?: boolean;
}

const OptimizedMarker = memo<OptimizedMarkerProps>(({ 
  spot, 
  isSelected, 
  onSpotClick, 
  zoomLevel, 
  showDetails,
  forceShowPopup = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const markerRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const lat = spot.lat;
  const lng = spot.lon;

  // Use the auto popup hook
  useAutoPopup(lat, lng, isSelected, showDetails || forceShowPopup, spot.shem_chenyon || spot.Name || 'Parking Spot');

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={isSelected ? selectedMarkerIcon : getMarkerIcon(spot.status_chenyon)}
      eventHandlers={{
        click: () => {
          if (onSpotClick) {
            onSpotClick(spot);
          }
        }
      }}
    >
      {(showDetails || forceShowPopup) && (
        <Popup 
          ref={popupRef}
          closeOnClick={false}
          autoClose={false}
          keepInView={true}
          closeButton={true}
          autoPan={isMobile ? true : false}
          maxWidth={isMobile ? 280 : 300}
          minWidth={isMobile ? 250 : 200}
        >
          <Box sx={{ p: 0 }}>
            <Paper elevation={0} sx={{ 
              p: isMobile ? 1.5 : 2, 
              minWidth: isMobile ? 250 : 200,
              maxWidth: isMobile ? 280 : 300,
            }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                gutterBottom 
                fontWeight="bold"
                sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
              >
                {spot.shem_chenyon || spot.Name || 'Parking Spot'}
              </Typography>
              
              {(forceShowPopup || zoomLevel >= (isMobile ? 14 : 15)) && (
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  paragraph
                  sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                >
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </Typography>
              )}
              
              <Typography 
                variant="body2" 
                color="textSecondary" 
                paragraph
                sx={{ fontSize: isMobile ? "0.875rem" : "0.875rem" }}
              >
                {spot.ktovet}
              </Typography>

              {spot.status_chenyon && (
                <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2, mb: isMobile ? 1.5 : 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
                  >
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 1 : 0 }}>
                    <Chip
                      label={spot.status_chenyon}
                      color={getStatusColor(spot.status_chenyon)}
                      size={isMobile ? "small" : "small"}
                      sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
                    />
                  </Box>
                </Paper>
              )}

              {(forceShowPopup || zoomLevel >= (isMobile ? 15 : 16)) && spot.taarif_yom && (
                <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2, mb: isMobile ? 1.5 : 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}
                  >
                    Pricing
                  </Typography>
                  <Typography 
                    variant="body2" 
                    paragraph
                    sx={{ fontSize: isMobile ? "0.875rem" : "0.875rem" }}
                  >
                    {spot.taarif_yom}
                  </Typography>
                  {spot.hearot_taarif && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                    >
                      {spot.hearot_taarif}
                    </Typography>
                  )}
                </Paper>
              )}
            </Paper>
          </Box>
        </Popup>
      )}
    </Marker>
  );
});

OptimizedMarker.displayName = 'OptimizedMarker';

export default OptimizedMarker;
