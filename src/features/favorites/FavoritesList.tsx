import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  alpha,
} from "@mui/material";
import { Star, Edit3, Trash2, MapPin } from "lucide-react";
import { useFavoritesStore, FavoriteSpot } from "../../stores/favoritesStore";
import { ParkingSpotWithStatus } from "../../Types/parking";

const WazeIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <img src="/waze-icon.svg" alt="Waze" width={size} height={size} style={{ display: "block" }} />
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
}) => {
  const theme = useTheme();
  const { favorites, removeFavorite, updateNickname } = useFavoritesStore();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteSpot | null>(null);
  const [editNickname, setEditNickname] = useState("");

  const handleSpotClick = (favorite: FavoriteSpot) => {
    onSpotClick?.(favorite.spot);
    onSpotSelect?.(favorite.id);
    if (isMobile) toggleDrawer?.();
  };

  const handleEditNickname = (favorite: FavoriteSpot, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFavorite(favorite);
    setEditNickname(favorite.nickname ?? "");
    setEditDialogOpen(true);
  };

  const handleSaveNickname = () => {
    if (editingFavorite) {
      updateNickname(editingFavorite.id, editNickname);
      setEditDialogOpen(false);
      setEditingFavorite(null);
      setEditNickname("");
    }
  };

  const handleWaze = (favorite: FavoriteSpot, e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lon } = favorite.spot;
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobileDevice
      ? `waze://?ll=${lat},${lon}&navigate=yes`
      : `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
    window.open(url, "_blank");
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "פנוי": return { color: theme.palette.success.main, label: "Available" };
      case "מעט": return { color: theme.palette.warning.main, label: "Limited" };
      case "מלא": return { color: theme.palette.error.main, label: "Full" };
      case "סגור": return { color: theme.palette.text.disabled, label: "Closed" };
      default: return { color: theme.palette.info.main, label: status || "Unknown" };
    }
  };

  if (favorites.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          px: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
          }}
        >
          <Star size={32} color={theme.palette.warning.main} strokeWidth={1.5} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No favorites yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tap the star on any parking spot to save it here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto", px: 0.5, pb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Star size={16} color={theme.palette.warning.main} fill={theme.palette.warning.main} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
          {favorites.length} saved spot{favorites.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {favorites.map((favorite) => {
          const statusStyle = getStatusStyle(favorite.spot.status_chenyon);
          const displayName = favorite.nickname ?? favorite.spot.shem_chenyon;

          return (
            <Paper
              key={favorite.id}
              elevation={0}
              onClick={() => handleSpotClick(favorite)}
              sx={{
                p: 2,
                cursor: "pointer",
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: "blur(8px)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.95),
                  borderColor: alpha(theme.palette.warning.main, 0.25),
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                },
                "&:active": { transform: "translateY(0)" },
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                {/* Star avatar */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.warning.main, 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Star size={18} color={theme.palette.warning.main} fill={theme.palette.warning.main} />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.25, noWrap: true }}
                    noWrap
                  >
                    {displayName}
                  </Typography>

                  {favorite.nickname && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.25, fontSize: "0.72rem" }}
                      noWrap
                    >
                      {favorite.spot.shem_chenyon}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
                    <MapPin size={11} color={theme.palette.text.disabled} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.72rem" }}
                      noWrap
                    >
                      {favorite.spot.ktovet}
                    </Typography>
                  </Box>

                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      backgroundColor: alpha(statusStyle.color, 0.12),
                      color: statusStyle.color,
                    }}
                  />
                </Box>

                {/* Action buttons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ml: 0.5 }}>
                  <Tooltip title="Navigate with Waze">
                    <IconButton
                      size="small"
                      onClick={(e) => handleWaze(favorite, e)}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: alpha("#00b8e6", 0.08),
                        "&:hover": { backgroundColor: alpha("#00b8e6", 0.18) },
                      }}
                    >
                      <WazeIcon size={15} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit nickname">
                    <IconButton
                      size="small"
                      onClick={(e) => handleEditNickname(favorite, e)}
                      sx={{
                        width: 30,
                        height: 30,
                        color: "text.secondary",
                        "&:hover": { color: "primary.main", backgroundColor: alpha(theme.palette.primary.main, 0.08) },
                      }}
                    >
                      <Edit3 size={14} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); removeFavorite(favorite.id); }}
                      sx={{
                        width: 30,
                        height: 30,
                        color: "text.secondary",
                        "&:hover": { color: "error.main", backgroundColor: alpha(theme.palette.error.main, 0.08) },
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Edit nickname dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Edit nickname</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editingFavorite?.spot.shem_chenyon}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nickname (optional)"
            value={editNickname}
            onChange={(e) => setEditNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
            placeholder="e.g. Near office"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNickname} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FavoritesList;
