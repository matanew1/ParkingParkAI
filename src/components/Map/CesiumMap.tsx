import React, { useEffect, useState, useCallback } from 'react';
import { Viewer, Entity, CameraFlyTo } from 'resium';
import { Cartesian3, Color, Math as CesiumMath } from 'cesium';
import { ParkingSpotWithStatus } from '../../Types/parking';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useParkingContext } from '../../Context/ParkingContext';

interface CesiumMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
}

const CesiumMap: React.FC<CesiumMapProps> = ({ parkingSpots, loading }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const { selectedSpot, setSelectedSpot } = useParkingContext();
  const [camera, setCamera] = useState({
    destination: Cartesian3.fromDegrees(34.7818, 32.0853, 5000),
    orientation: {
      heading: CesiumMath.toRadians(0),
      pitch: CesiumMath.toRadians(-45),
      roll: 0
    }
  });

  const handleEntityClick = useCallback((spot: ParkingSpotWithStatus) => {
    setSelectedEntity(spot.AhuzotCode);
    setSelectedSpot(`${spot.GPSLattitude},${spot.GPSLongitude}`);
    setCamera({
      destination: Cartesian3.fromDegrees(
        parseFloat(spot.GPSLongitude),
        parseFloat(spot.GPSLattitude),
        500
      ),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-45),
        roll: 0
      }
    });
  }, [setSelectedSpot]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
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
      style={{ width: '100%', height: '100%' }}
    >
      <Viewer
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        geocoder={false}
        sceneModePicker={false}
      >
        <CameraFlyTo {...camera} duration={2} />
        
        {parkingSpots.map((spot) => (
          <Entity
            key={spot.AhuzotCode}
            position={Cartesian3.fromDegrees(
              parseFloat(spot.GPSLongitude),
              parseFloat(spot.GPSLattitude),
              selectedEntity === spot.AhuzotCode ? 200 : 100
            )}
            billboard={{
              image: spot.status?.InformationToShow === 'מלא' 
                ? '/red-marker.png'
                : '/green-marker.png',
              verticalOrigin: 1,
              scale: selectedEntity === spot.AhuzotCode ? 1.5 : 1,
            }}
            label={{
              text: spot.Name,
              font: '14px sans-serif',
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: 2,
              verticalOrigin: 1,
              pixelOffset: new Cartesian3(0, -32, 0),
              show: selectedEntity === spot.AhuzotCode,
            }}
            description={`
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0;">${spot.Name}</h3>
                <p style="margin: 5px 0;">${spot.Address}</p>
                <p style="margin: 5px 0;">Status: ${spot.status?.InformationToShow || 'Unknown'}</p>
                ${spot.DaytimeFee ? `<p style="margin: 5px 0;">Fee: ${spot.DaytimeFee}</p>` : ''}
              </div>
            `}
            onClick={() => handleEntityClick(spot)}
          />
        ))}
      </Viewer>
    </motion.div>
  );
};

export default React.memo(CesiumMap);