import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import { Star, StarOff } from 'lucide-react';
import { useFavorites } from '../../Context/FavoritesContext';
import { ParkingSpotWithStatus } from '../../Types/parking';

interface FavoriteToggleButtonProps {
  spot: ParkingSpotWithStatus;
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'secondary';
  showTooltip?: boolean;
  className?: string;
}

const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  spot,
  size = 'medium',
  color = 'default',
  showTooltip = true,
  className,
}) => {
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const spotId = spot.code_achoza.toString();
  const isCurrentlyFavorite = isFavorite(spotId);

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent parent click events
    
    try {
      const success = await toggleFavorite(spot);
      
      if (success) {
        const message = isCurrentlyFavorite 
          ? 'Removed from favorites' 
          : 'Added to favorites';
        setSnackbarMessage(message);
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Failed to update favorites');
        setSnackbarSeverity('error');
      }
      
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update favorites';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 28;
      default: return 20;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32 };
      case 'large': return { width: 48, height: 48 };
      default: return { width: 40, height: 40 };
    }
  };

  const tooltipTitle = isCurrentlyFavorite 
    ? 'Remove from favorites' 
    : 'Add to favorites';

  const iconColor = isCurrentlyFavorite 
    ? theme.palette.warning.main 
    : theme.palette.text.secondary;

  const hoverColor = isCurrentlyFavorite 
    ? theme.palette.warning.main 
    : theme.palette.warning.main;

  const button = (
    <IconButton
      onClick={handleToggleFavorite}
      className={className}
      sx={{
        ...getButtonSize(),
        color: iconColor,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        '&:hover': {
          color: hoverColor,
          backgroundColor: alpha(hoverColor, 0.1),
          transform: 'scale(1.1)',
          border: `1px solid ${alpha(hoverColor, 0.3)}`,
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {isCurrentlyFavorite ? (
        <Star size={getIconSize()} fill="currentColor" />
      ) : (
        <Star size={getIconSize()} />
      )}
    </IconButton>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={tooltipTitle} placement="top">
          {button}
        </Tooltip>
      ) : (
        button
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FavoriteToggleButton;
