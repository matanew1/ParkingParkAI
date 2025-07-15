import React, { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Clock } from 'lucide-react';
import { ParkingSpotWithStatus } from '../../Types/parking';
import { getMarkerIcon, selectedMarkerIcon } from './utils/MarkerUtils';
import { getStatusColor, getTypeColor } from '../../utils/colorUtils';

interface OptimizedMarkerProps {
  spot: ParkingSpotWithStatus;
  isSelected: boolean;
  onSpotClick?: (spot: ParkingSpotWithStatus) => void;
  zoomLevel: number;
  showDetails: boolean;
}

const OptimizedMarker = memo<OptimizedMarkerProps>(({ 
  spot, 
  isSelected, 
  onSpotClick, 
  zoomLevel, 
  showDetails 
}) => {
  const lat = spot.lat;
  const lng = spot.lon;

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return (
    <Marker
      position={[lat, lng]}
      icon={isSelected ? selectedMarkerIcon : getMarkerIcon(spot.status_chenyon)}
      eventHandlers={{
        click: () => {
          if (onSpotClick) {
            onSpotClick(spot);
          }
        },
      }}
    >
      {showDetails && (
        <Popup 
          closeOnClick={false}
          autoClose={false}
          keepInView={true}
          closeButton={true}
          autoPan={false}
        >
          <Box sx={{ p: 0 }}>
            <Paper elevation={0} sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {spot.shem_chenyon || spot.Name || 'Parking Spot'}
              </Typography>
              
              {zoomLevel >= 15 && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </Typography>
              )}
              
              <Typography variant="body2" color="textSecondary" paragraph>
                {spot.ktovet}
              </Typography>

              {spot.status_chenyon && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={spot.status_chenyon}
                      color={getStatusColor(spot.status_chenyon)}
                      size="small"
                    />
                    {spot.tr_status_chenyon && spot.tr_status_chenyon > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Clock size={14} style={{ marginRight: 4 }} />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(spot.tr_status_chenyon).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {zoomLevel >= 16 && spot.taarif_yom && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pricing
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {spot.taarif_yom}
                  </Typography>
                  {spot.hearot_taarif && (
                    <Typography variant="caption" color="textSecondary">
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
