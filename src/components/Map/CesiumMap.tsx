import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Viewer, Entity, CameraFlyTo } from 'resium';
import { Cartesian3, Color, Math as CesiumMath, Viewer as CesiumViewer, HeightReference, VerticalOrigin } from 'cesium';
import { ParkingSpotWithStatus } from '../../Types/parking';
import { Box, CircularProgress, Typography, Paper, Fade } from '@mui/material';
import { motion } from 'framer-motion';
import { useParkingContext } from '../../Context/ParkingContext';
import { Navigation, Share, Info } from 'lucide-react';

interface CesiumMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
}

const CesiumMap: React.FC<CesiumMapProps> = ({ parkingSpots, loading }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const { selectedSpot, setSelectedSpot, userLocation } = useParkingContext();
  const viewerRef = useRef<CesiumViewer | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [camera, setCamera] = useState({
    destination: Cartesian3.fromDegrees(34.7818, 32.0853, 5000),
    orientation: {
      heading: CesiumMath.toRadians(0),
      pitch: CesiumMath.toRadians(-45),
      roll: 0
    }
  });

  const calculateDistance = useCallback((spot: ParkingSpotWithStatus) => {
    if (!userLocation) return null;
    const lat1 = userLocation[0];
    const lon1 = userLocation[1];
    const lat2 = parseFloat(spot.GPSLattitude);
    const lon2 = parseFloat(spot.GPSLongitude);
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }, [userLocation]);

  const handleEntityClick = useCallback((spot: ParkingSpotWithStatus) => {
    setSelectedEntity(spot.AhuzotCode);
    setSelectedSpot(`${spot.GPSLattitude},${spot.GPSLongitude}`);
    setShowPopup(true);
    
    const newDestination = Cartesian3.fromDegrees(
      parseFloat(spot.GPSLongitude),
      parseFloat(spot.GPSLattitude),
      200
    );

    setCamera({
      destination: newDestination,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-45),
        roll: 0
      }
    });
  }, [setSelectedSpot]);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.scene.globe.enableLighting = true;
      viewerRef.current.scene.fog.enabled = true;
      viewerRef.current.scene.fog.density = 0.0001;
      viewerRef.current.scene.fog.screenSpaceErrorFactor = 2.0;
    }
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        flexDirection="column"
        gap={2}
        className="animate-fade-in"
      >
        <CircularProgress size={60} className="animate-pulse" />
        <Typography variant="h6" color="textSecondary" className="animate-fade-in">
          Loading 3D Map...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Viewer
        ref={(ref) => {
          if (ref?.cesiumElement) {
            viewerRef.current = ref.cesiumElement;
          }
        }}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        geocoder={false}
        sceneModePicker={false}
        terrainProvider={undefined}
        requestRenderMode={true}
        maximumRenderTimeChange={Infinity}
      >
        <CameraFlyTo {...camera} duration={2} />
        
        {parkingSpots.map((spot) => {
          const isSelected = selectedEntity === spot.AhuzotCode;
          const height = isSelected ? 200 : 100;
          
          return (
            <Entity
              key={spot.AhuzotCode}
              position={Cartesian3.fromDegrees(
                parseFloat(spot.GPSLongitude),
                parseFloat(spot.GPSLattitude),
                height
              )}
              billboard={{
                image: spot.status?.InformationToShow === 'מלא'
                  ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                  : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                verticalOrigin: VerticalOrigin.BOTTOM,
                scale: isSelected ? 1.5 : 1,
                pixelOffset: new Cartesian3(0, 12, 0),
                heightReference: HeightReference.RELATIVE_TO_GROUND,
              }}
              point={{
                pixelSize: isSelected ? 15 : 10,
                color: spot.status?.InformationToShow === 'מלא' 
                  ? Color.RED 
                  : Color.GREEN,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
                heightReference: HeightReference.RELATIVE_TO_GROUND,
              }}
              onClick={() => handleEntityClick(spot)}
            />
          );
        })}
      </Viewer>

      {selectedEntity && showPopup && (
        <Fade in={showPopup}>
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: '90%', sm: '400px' },
              maxWidth: '500px',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {parkingSpots.map((spot) => (
              spot.AhuzotCode === selectedEntity && (
                <Box key={spot.AhuzotCode} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {spot.Name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {spot.Address}
                  </Typography>

                  <Box sx={{ 
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: spot.status?.InformationToShow === 'מלא' ? 'error.light' : 'success.light',
                    color: spot.status?.InformationToShow === 'מלא' ? 'error.dark' : 'success.dark',
                  }}>
                    <Typography variant="subtitle2">
                      Status: {spot.status?.InformationToShow || 'Unknown'}
                    </Typography>
                  </Box>

                  {userLocation && (
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      Distance: {calculateDistance(spot)}
                    </Typography>
                  )}

                  {spot.DaytimeFee && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="primary">
                        Pricing Information
                      </Typography>
                      <Typography variant="body2">
                        {spot.DaytimeFee}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ 
                    mt: 3,
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'flex-end'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
                      onClick={() => {/* Navigation logic */}}
                    >
                      <Navigation size={20} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
                      onClick={() => {/* Share logic */}}
                    >
                      <Share size={20} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-colors"
                      onClick={() => {/* Info logic */}}
                    >
                      <Info size={20} />
                    </motion.button>
                  </Box>
                </Box>
              )
            ))}
          </Paper>
        </Fade>
      )}
    </motion.div>
  );
};

export default React.memo(CesiumMap);