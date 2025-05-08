import React, { useEffect } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color } from 'cesium';
import { ParkingSpotWithStatus } from '../../Types/parking';
import { Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

interface CesiumMapProps {
  parkingSpots: ParkingSpotWithStatus[];
  loading: boolean;
}

const CesiumMap: React.FC<CesiumMapProps> = ({ parkingSpots, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
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
      >
        {parkingSpots.map((spot) => (
          <Entity
            key={spot.AhuzotCode}
            position={Cartesian3.fromDegrees(
              parseFloat(spot.GPSLongitude),
              parseFloat(spot.GPSLattitude),
              100
            )}
            point={{
              pixelSize: 10,
              color: spot.status?.InformationToShow === 'מלא' 
                ? Color.RED 
                : Color.GREEN,
            }}
            description={`
              <h2>${spot.Name}</h2>
              <p>${spot.Address}</p>
              <p>Status: ${spot.status?.InformationToShow || 'Unknown'}</p>
            `}
          />
        ))}
      </Viewer>
    </motion.div>
  );
};

export default CesiumMap;