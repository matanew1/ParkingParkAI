import React from "react";
import { Box, Switch, FormControlLabel, Typography, Chip } from "@mui/material";
import { Car, AlertTriangle } from "lucide-react";
import { useTrafficContext } from "../../Context/TrafficContext";

const TrafficToggle: React.FC = () => {
  const { 
    showTrafficReports, 
    setShowTrafficReports, 
    trafficReports, 
    loading,
    error 
  } = useTrafficContext();

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowTrafficReports(event.target.checked);
  };

  const getTrafficStats = () => {
    if (!trafficReports.length) return null;
    
    const stats = trafficReports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const stats = getTrafficStats();

  return (
    <Box sx={{ mb: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={showTrafficReports}
            onChange={handleToggle}
            color="primary"
            disabled={loading}
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Car size={16} style={{ marginRight: 8 }} />
            <Typography variant="body2">
              Traffic Reports (Waze)
            </Typography>
          </Box>
        }
      />
      
      {showTrafficReports && (
        <Box sx={{ mt: 1, ml: 4 }}>
          {loading && (
            <Typography variant="caption" color="textSecondary">
              Loading traffic data...
            </Typography>
          )}
          
          {error && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AlertTriangle size={14} color="#f39c12" />
              <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>
                Traffic data unavailable
              </Typography>
            </Box>
          )}
          
          {stats && !loading && !error && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Object.entries(stats).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TrafficToggle;