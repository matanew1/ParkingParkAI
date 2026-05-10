import React from "react";
import { useTimer } from "../../hooks/useTimer";
import { Box, IconButton, alpha, Tooltip, CircularProgress } from "@mui/material";
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
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          },
          "&:disabled": {
            backgroundColor: (theme) => alpha(theme.palette.action.disabled, 0.1),
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
