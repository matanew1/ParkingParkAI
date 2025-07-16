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
  useMediaQuery,
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
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");
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
        p: { xs: 1.5, sm: 6 },
        overflow: "hidden",
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>  
          <RefreshCw 
            size={isMobile ? 16 : 18} 
            style={{ 
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              color: theme.palette.primary.main,
            }} 
          />
          <Typography 
            variant="h3" 
            sx={{ 
              ml: { xs: 1, sm: 1.5 }, 
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {isSmallMobile ? "Refresh" : "Auto Refresh"}
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 500,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {formatTime(timeLeft)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: { xs: 6, sm: 8 },
          borderRadius: 4,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          mb: { xs: 1, sm: 2 },
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
        startIcon={!isSmallMobile && <RefreshCw size={isMobile ? 14 : 16} />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          py: { xs: 0.75, sm: 1 },
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          minHeight: { xs: 36, sm: 40 },
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        {isRefreshing ? (isSmallMobile ? "..." : "Refreshing...") : (isSmallMobile ? "Refresh" : "Refresh Now")}
      </Button>
    </Paper>
  );
};

export default RefreshControl;
