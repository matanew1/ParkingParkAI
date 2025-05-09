import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, Paper } from '@mui/material';
import { Map, Cuboid as Cube } from 'lucide-react';
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
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: { xs: 80, sm: 88, md: 96 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <ToggleButtonGroup
          value={mapType}
          exclusive
          onChange={(_, value) => value && onMapTypeChange(value)}
          aria-label="map type"
          sx={{
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1.5,
              borderRadius: 0,
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="2d" aria-label="2D map">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Map size={20} />
              <Typography variant="button">2D Map</Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="3d" aria-label="3D map">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Cube size={20} />
              <Typography variant="button">3D Map</Typography>
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </motion.div>
  );
};

export default React.memo(MapSelector);