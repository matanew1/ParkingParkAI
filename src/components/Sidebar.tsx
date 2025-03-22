import React, { useState, useEffect } from "react";
import { X, Clock, ChevronRight, RefreshCw } from "lucide-react";
import { SidebarProps } from "../types/parking";
import { AxiosError } from "axios";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Chip,
  useTheme,
  InputAdornment,
  Divider,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Sidebar: React.FC<SidebarProps> = ({
  spots,
  onSpotClick,
  onSpotSelect,
  lastUpdated,
  onRefresh,
  isRefreshing,
  toggleDrawer,
  isMobile,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lastValidStatus, setLastValidStatus] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const REFRESH_INTERVAL = 300; // Total refresh interval in seconds

  useEffect(() => {
    const cachedStatus = localStorage.getItem("lastValidStatus");
    if (cachedStatus) {
      setCachedData(JSON.parse(cachedStatus));
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleRefresh();
          return REFRESH_INTERVAL; // Reset timer to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressColor = (value: number) => {
    if (value < 25) return theme.palette.text.primary;
    if (value < 50) return theme.palette.info.main;
    if (value < 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const filteredSpots = spots.filter(
    (spot) =>
      spot.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      spot.Address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleRefresh = async () => {
    try {
      onRefresh();
      setLastValidStatus(null);
      setTimeLeft(REFRESH_INTERVAL); // Reset timer after manual refresh
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 500) {
          setLastValidStatus(lastValidStatus);
          const cachedStatus = localStorage.getItem("lastValidStatus");
          if (cachedStatus) {
            setCachedData(JSON.parse(cachedStatus));
          }
        } else {
          setLastValidStatus(null);
          setCachedData(null);
        }
      } else {
        setLastValidStatus(null);
        setCachedData(null);
      }
    }
  };

  const handleSpotStatus = (spot) => {
    if (spot.status && spot.status.InformationToShow !== "Unknown") {
      return spot.status.InformationToShow;
    }
    if (cachedData) {
      return cachedData;
    }
    return "Status unavailable... Please refresh again";
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage (inverted, as we want to show time elapsed)
  const progressValue =
    ((REFRESH_INTERVAL - timeLeft) / REFRESH_INTERVAL) * 100;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6">Parking Spots</Typography>
        {isMobile && (
          <IconButton onClick={toggleDrawer} aria-label="Close sidebar">
            <X size={20} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search parking spots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Clock size={16} />
            <Typography variant="caption" sx={{ ml: 1 }}>
              {lastUpdated
                ? `Updated: ${lastUpdated.toLocaleTimeString()}`
                : "Loading data..."}
            </Typography>
          </Box>
        </Box>

        {/* Clickable refresh button with integrated progress bar */}
        <Paper
          elevation={1}
          onClick={isRefreshing ? undefined : handleRefresh}
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

              {/* Centered text on top of progress bar */}
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
                      progressValue > 50
                        ? "0px 0px 2px rgba(0,0,0,0.3)"
                        : "none",
                  }}
                >
                  {isRefreshing ? "REFRESHING..." : "REFRESH"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 1 }} />

        <List disablePadding>
          {filteredSpots.length > 0 ? (
            filteredSpots.map((spot) => (
              <Paper
                key={spot.AhuzotCode}
                elevation={1}
                sx={{
                  mb: 1,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <ListItemButton
                  onClick={() => {
                    onSpotSelect(spot.AhuzotCode);
                    onSpotClick(spot);
                    if (isMobile) toggleDrawer();
                  }}
                >
                  <ListItem disablePadding>
                    <Box sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle1" noWrap>
                          {spot.Name}
                        </Typography>
                        <ChevronRight
                          size={16}
                          color={theme.palette.text.secondary}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {spot.Address}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={handleSpotStatus(spot)}
                          size="small"
                          color={
                            handleSpotStatus(spot) === "מלא"
                              ? "error"
                              : "success"
                          }
                          sx={{ height: 24 }}
                        />
                        {spot.status && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Clock size={12} />
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ ml: 0.5 }}
                            >
                              {new Date(
                                spot.status.LastUpdateFromDambach
                              ).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                </ListItemButton>
              </Paper>
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="textSecondary">
                No parking spots match your search.
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
