import React from "react";
import { useTimer } from "../Hooks/useTimer";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
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
  const theme = useTheme();
  const REFRESH_INTERVAL = 300; // 5 minutes in seconds

  const { timeLeft, progressValue, resetTimer, formatTime } = useTimer({
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
    <Paper
      elevation={1}
      sx={{
        p: 2,
        overflow: "hidden",
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        background: (theme) => alpha(theme.palette.background.paper, 0.8),
        opacity: isRefreshing ? 0.7 : 1,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <RefreshCw 
            size={18} 
            style={{ 
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              color: theme.palette.primary.main,
            }} 
          />
          <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 600 }}>
            Auto Refresh
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {formatTime(timeLeft)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          mb: 2,
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        }}
      />

      <Button
        fullWidth
        variant="outlined"
        onClick={handleRefresh}
        disabled={isRefreshing}
        startIcon={<RefreshCw size={16} />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          py: 1,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        {isRefreshing ? "Refreshing..." : "Refresh Now"}
      </Button>
    </Paper>
  );
};

export default RefreshControl;
