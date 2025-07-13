import React from "react";
import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { Clock, ThumbsUp } from "lucide-react";
import { TrafficReport } from "../../types/traffic";
import { TrafficService } from "../../Services/trafficService";

interface TrafficMarkersProps {
  reports: TrafficReport[];
}

const trafficService = new TrafficService();

// Create traffic marker icons
const createTrafficIcon = (type: string) => {
  const color = trafficService.getReportTypeColor(type);
  const icon = trafficService.getReportTypeIcon(type);
  
  return divIcon({
    className: "traffic-marker-icon",
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${icon}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const TrafficMarkers: React.FC<TrafficMarkersProps> = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <>
      {reports.map((report) => {
        if (!report.lat || !report.lon || isNaN(report.lat) || isNaN(report.lon)) {
          return null;
        }

        return (
          <Marker
            key={report.OBJECTID}
            position={[report.lat, report.lon]}
            icon={createTrafficIcon(report.type)}
          >
            <Popup>
              <Box sx={{ p: 0, minWidth: 280 }}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <span style={{ fontSize: "20px", marginRight: "8px" }}>
                      {trafficService.getReportTypeIcon(report.type)}
                    </span>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {trafficService.getTypeDisplayEnglish(report.type)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {trafficService.getTypeDisplayHebrew(report.type)}
                      </Typography>
                    </Box>
                  </Box>

                  {report.street && (
                    <Typography variant="body2" color="textSecondary" paragraph>
                      📍 {report.street}
                      {report.city && `, ${report.city}`}
                    </Typography>
                  )}

                  {report.subtype && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Details:</strong> {report.subtype.replace(/_/g, ' ')}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    <Chip
                      label={`Rating: ${report.reportRating}/5`}
                      size="small"
                      color={report.reportRating >= 4 ? "success" : report.reportRating >= 2 ? "warning" : "error"}
                    />
                    <Chip
                      label={`Confidence: ${report.confidence}/5`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Reliability: ${report.reliability}/10`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ThumbsUp size={14} />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {report.nThumbsUp} likes
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Clock size={14} />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {new Date(parseInt(report.pubMillis)).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
                    Source: Waze • Courtesy of Tel Aviv Municipality
                  </Typography>
                </Paper>
              </Box>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default TrafficMarkers;