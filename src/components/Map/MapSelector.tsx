import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Map, Cube } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapSelectorProps {
  mapType: '2d' | '3d';
  onMapTypeChange: (type: '2d' | '3d') => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ mapType, onMapTypeChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 80, sm: 88, md: 96 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 1,
        }}
      >
        <ToggleButtonGroup
          value={mapType}
          exclusive
          onChange={(_, value) => value && onMapTypeChange(value)}
          aria-label="map type"
        >
          <ToggleButton value="2d" aria-label="2D map">
            <Map className="mr-2" size={20} />
            <Typography variant="button">2D</Typography>
          </ToggleButton>
          <ToggleButton value="3d" aria-label="3D map">
            {/* <Cube className="mr-2" size={20} /> */}
            <Typography variant="button">3D</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </motion.div>
  );
};

export default MapSelector;