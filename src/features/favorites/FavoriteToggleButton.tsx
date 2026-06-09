import React, { useState } from "react";
import { IconButton, Tooltip, Snackbar, Alert, useTheme, alpha } from "@mui/material";
import { Star } from "lucide-react";
import { useFavoritesStore } from "../../stores/favoritesStore";
import { ParkingSpotWithStatus } from "../../Types/parking";

interface FavoriteToggleButtonProps {
  spot: ParkingSpotWithStatus;
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
  className?: string;
}

const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  spot,
  size = "medium",
  showTooltip = true,
  className,
}) => {
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const spotId = spot.code_achoza.toString();
  const isFav = isFavorite(spotId);

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    toggleFavorite(spot);
    setSnackbarMessage(isFav ? "Removed from favorites" : "Added to favorites");
    setSnackbarOpen(true);
  };

  const iconSize = size === "small" ? 16 : size === "large" ? 28 : 20;
  const btnSize = size === "small" ? 32 : size === "large" ? 48 : 40;
  const color = isFav ? theme.palette.warning.main : theme.palette.text.secondary;

  const button = (
    <IconButton
      onClick={handleToggle}
      className={className}
      sx={{
        width: btnSize,
        height: btnSize,
        borderRadius: "10px",
        color,
        backgroundColor: isFav
          ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.18 : 0.1)
          : alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.28 : 0.42),
        border: `1px solid ${
          isFav ? alpha(theme.palette.warning.main, 0.18) : alpha(theme.palette.divider, 0.12)
        }`,
        "&:hover": {
          color: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.24 : 0.14),
          transform: "translateY(-1px)",
        },
        transition:
          "background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease",
      }}
    >
      <Star size={iconSize} fill={isFav ? "currentColor" : "none"} />
    </IconButton>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={isFav ? "Remove from favorites" : "Add to favorites"} placement="top">
          {button}
        </Tooltip>
      ) : (
        button
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FavoriteToggleButton;
