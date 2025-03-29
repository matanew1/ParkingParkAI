import React from "react";
import { useTimer } from "../Hooks/useTimer";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  useTheme,
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

  const progressColor = (value: number) => {
    if (value < 25) return "black";
    if (value < 50) return "orange";
    if (value < 75) return "red";
    return theme.palette.success.main;
  };

  return (
    <Paper
      elevation={1}
      onClick={handleRefresh}
      sx={{
        mb: 2,
        overflow: "hidden",
        cursor: isRefreshing ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: isRefreshing ? "none" : "translateY(-2px)",
        },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        opacity: isRefreshing ? 0.7 : 1,
      }}
    >
      <Box sx={{ p: 1.5, position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isRefreshing ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            <Typography variant="body2" sx={{ ml: 1.5, fontWeight: 500 }}>
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary">
            {formatTime(timeLeft)}
          </Typography>
        </Box>

        {/* Progress bar with integrated label */}
        <Box sx={{ position: "relative", height: 30 }}>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 30,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 550,
                color: progressColor(progressValue),
                zIndex: 1,
                textShadow:
                  progressValue > 50 ? "0px 0px 2px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {isRefreshing ? "REFRESHING..." : "REFRESH"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default RefreshControl;
