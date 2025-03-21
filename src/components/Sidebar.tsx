import React, { useState, useEffect } from "react";
import { X, Clock, ChevronRight, RefreshCw } from "lucide-react";
import { SidebarProps } from "../types/parking";
import { AxiosError } from "axios";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Chip,
  useTheme,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const Sidebar: React.FC<SidebarProps> = ({
  spots,
  onSpotClick,
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
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null); // Track selected spot

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

  const filteredSpots = spots.filter(
    (spot) =>
      spot.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      spot.Address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleRefresh = async () => {
    try {
      onRefresh();
      setLastValidStatus(null);
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
          <Button
            size="small"
            variant="outlined"
            onClick={handleRefresh}
            disabled={isRefreshing}
            startIcon={
              isRefreshing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )
            }
          >
            Refresh
          </Button>
        </Box>

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
                  ...(selectedSpot === spot.AhuzotCode && {
                    boxShadow: "0 0 15px 5px rgba(255, 0, 0, 0.5)", // Add glowing effect
                  }),
                }}
              >
                <ListItemButton
                  onClick={() => {
                    setSelectedSpot(spot.AhuzotCode);
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
