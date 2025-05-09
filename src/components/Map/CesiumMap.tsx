import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Viewer, Entity, CameraFlyTo } from 'resium';
import { Cartesian3, Color, Math as CesiumMath, Viewer as CesiumViewer } from 'cesium';
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
  const viewerRef = useRef<CesiumViewer | null>(null);
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
    
    const newDestination = Cartesian3.fromDegrees(
      parseFloat(spot.GPSLongitude),
      parseFloat(spot.GPSLattitude),
      500
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
      style={{ width: '100%', height: '100%' }}
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
                verticalOrigin: 1,
                scale: isSelected ? 1.5 : 1,
                pixelOffset: new Cartesian3(0, 12, 0),
              }}
              point={{
                pixelSize: isSelected ? 15 : 10,
                color: spot.status?.InformationToShow === 'מלא' 
                  ? Color.RED 
                  : Color.GREEN,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
                heightReference: 1,
              }}
              label={{
                text: spot.Name,
                font: '16px sans-serif',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                style: 2,
                verticalOrigin: 1,
                pixelOffset: new Cartesian3(0, -32, 0),
                show: isSelected,
                backgroundColor: Color.fromAlpha(Color.BLACK, 0.5),
                showBackground: true,
                backgroundPadding: new Cartesian3(7, 5, 0),
              }}
              description={`
                <div style="
                  padding: 15px;
                  background: rgba(255, 255, 255, 0.95);
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                ">
                  <h3 style="
                    margin: 0 0 10px 0;
                    color: #1976d2;
                    font-size: 1.2em;
                  ">${spot.Name}</h3>
                  <p style="
                    margin: 5px 0;
                    color: #666;
                  ">${spot.Address}</p>
                  <div style="
                    margin: 10px 0;
                    padding: 8px;
                    background: ${spot.status?.InformationToShow === 'מלא' ? '#fee2e2' : '#dcfce7'};
                    border-radius: 4px;
                    color: ${spot.status?.InformationToShow === 'מלא' ? '#dc2626' : '#16a34a'};
                  ">
                    Status: ${spot.status?.InformationToShow || 'Unknown'}
                  </div>
                  ${spot.DaytimeFee ? `
                    <div style="
                      margin-top: 10px;
                      padding-top: 10px;
                      border-top: 1px solid #eee;
                    ">
                      <strong>Fee:</strong> ${spot.DaytimeFee}
                    </div>
                  ` : ''}
                </div>
              `}
              onClick={() => handleEntityClick(spot)}
            />
          );
        })}
      </Viewer>
    </motion.div>
  );
};

export default React.memo(CesiumMap);