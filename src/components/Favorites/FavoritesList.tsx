import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  alpha,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  Star,
  StarOff,
  MapPin,
  Edit,
  Trash2,
  Navigation,
  Calendar,
  Clock,
} from 'lucide-react';
import { useFavorites } from '../../Context/FavoritesContext';
import { FavoriteSpot } from '../../Services/favoritesService';
import { ParkingSpotWithStatus } from '../../Types/parking';
import { getStatusColor } from '../../utils/colorUtils';

// Waze Icon Component
const WazeIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <img
    src="/waze-icon.svg"
    alt="Waze"
    width={size}
    height={size}
    style={{ display: 'block' }}
  />
);

interface FavoritesListProps {
  onSpotClick?: (spot: ParkingSpotWithStatus) => void;
  onSpotSelect?: (spotId: string) => void;
  toggleDrawer?: () => void;
  isMobile?: boolean;
  maxHeight?: string;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  onSpotClick,
  onSpotSelect,
  toggleDrawer,
  isMobile = false,
  maxHeight = '400px',
}) => {
  const theme = useTheme();
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  const { favorites, removeFromFavorites, updateNickname } = useFavorites();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteSpot | null>(null);
  const [editNickname, setEditNickname] = useState('');

  const handleSpotClick = (favorite: FavoriteSpot) => {
    if (onSpotClick) {
      onSpotClick(favorite.spot);
    }
    if (onSpotSelect) {
      onSpotSelect(favorite.id);
    }
    if (isMobile && toggleDrawer) {
      toggleDrawer();
    }
  };

  const handleRemoveFavorite = async (spotId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await removeFromFavorites(spotId);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleEditNickname = (favorite: FavoriteSpot, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingFavorite(favorite);
    setEditNickname(favorite.nickname || '');
    setEditDialogOpen(true);
  };

  const handleSaveNickname = async () => {
    if (editingFavorite) {
      try {
        await updateNickname(editingFavorite.id, editNickname);
        setEditDialogOpen(false);
        setEditingFavorite(null);
        setEditNickname('');
      } catch (error) {
        console.error('Failed to update nickname:', error);
      }
    }
  };

  const handleWazeNavigation = (favorite: FavoriteSpot, event: React.MouseEvent) => {
    event.stopPropagation();
    const { lat, lon } = favorite.spot;
    
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileDevice) {
      const wazeUrl = `waze://?ll=${lat},${lon}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    } else {
      const url = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  if (favorites.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
        }}
      >
        <Star size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No Favorite Spots Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tap the star icon on any parking spot to add it to your favorites
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        px: isMobile ? 1 : 0
      }}>
        <Star size={20} color={theme.palette.warning.main} />
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
          Favorite Spots ({favorites.length})
        </Typography>
      </Box>

      <List 
        sx={{ 
          maxHeight,
          overflow: 'auto',
          p: 0,
          '& .MuiListItem-root': {
            p: 0,
          }
        }}
      >
        {favorites.map((favorite, index) => (
          <React.Fragment key={favorite.id}>
            <ListItem disablePadding>
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  mb: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                    transform: isMobile ? 'translateY(-2px)' : 'translateY(-4px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                <ListItemButton 
                  onClick={() => handleSpotClick(favorite)}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Avatar
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        mr: { xs: 1.5, sm: 2 },
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      }}
                    >
                      <Star size={isMobile ? 16 : 20} color={theme.palette.warning.main} />
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 0.5 
                      }}>
                        <Typography 
                          variant={isMobile ? 'body1' : 'subtitle1'} 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                          noWrap
                        >
                          {favorite.nickname || favorite.spot.shem_chenyon}
                        </Typography>
                      </Box>

                      {favorite.nickname && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {favorite.spot.shem_chenyon}
                        </Typography>
                      )}
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1, 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                        noWrap
                      >
                        {favorite.spot.ktovet}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        flexWrap: 'wrap'
                      }}>
                        <Chip
                          label={favorite.spot.status_chenyon}
                          color={getStatusColor(favorite.spot.status_chenyon)}
                          size="small"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={12} color={theme.palette.text.secondary} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(favorite.dateAdded)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                      <Tooltip title="Navigate with Waze">
                        <IconButton
                          size="small"
                          onClick={(e) => handleWazeNavigation(favorite, e)}
                          sx={{
                            color: '#00D4FF',
                            '&:hover': {
                              backgroundColor: alpha('#00D4FF', 0.1),
                            },
                          }}
                        >
                          <WazeIcon size={isSmallMobile ? 14 : 16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit nickname">
                        <IconButton
                          size="small"
                          onClick={(e) => handleEditNickname(favorite, e)}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          <Edit size={isSmallMobile ? 14 : 16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Remove from favorites">
                        <IconButton
                          size="small"
                          onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.error.main,
                            },
                          }}
                        >
                          <StarOff size={isSmallMobile ? 14 : 16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </ListItemButton>
              </Paper>
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      {/* Edit Nickname Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Nickname</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editingFavorite?.spot.shem_chenyon} - {editingFavorite?.spot.ktovet}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nickname (optional)"
            value={editNickname}
            onChange={(e) => setEditNickname(e.target.value)}
            placeholder="e.g., Near office, Main shopping area"
            helperText="Give this parking spot a memorable name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveNickname} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FavoritesList;
