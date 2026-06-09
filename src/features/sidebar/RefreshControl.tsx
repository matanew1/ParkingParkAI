import React from "react";
import { useTimer } from "../../hooks/useTimer";
import { IconButton, alpha, Tooltip, CircularProgress } from "@mui/material";
import { RefreshCw } from "lucide-react";

interface RefreshControlProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  statusError: string | null;
}

const RefreshControl: React.FC<RefreshControlProps> = ({
  onRefresh,
  isRefreshing,
}) => {
  const REFRESH_INTERVAL = 300;

  const { resetTimer } = useTimer({
    initialTime: REFRESH_INTERVAL,
    onComplete: onRefresh,
  });

  const handleRefresh = () => {
    if (!isRefreshing) {
      onRefresh();
      resetTimer();
    }
  };

  return (
    <Tooltip title={isRefreshing ? "Refreshing..." : "Refresh now"}>
      <IconButton
        onClick={handleRefresh}
        disabled={isRefreshing}
        size="small"
        sx={{
          width: 32,
          height: 32,
          borderRadius: "10px",
          backgroundColor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
          color: "primary.main",
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          "&:hover": {
            backgroundColor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.26 : 0.16),
          },
          "&:disabled": {
            backgroundColor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.06),
            color: "primary.main",
          },
        }}
      >
        {isRefreshing ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <RefreshCw size={16} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default RefreshControl;
