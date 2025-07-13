import axios from "axios";
import { CacheManager } from "../utils/CacheManager";
import { TrafficReport, TrafficApiResponse } from "../types/traffic";

const TRAFFIC_API_URL = "/api/arcgis/rest/services/IView2/MapServer/891/query?where=1%3D1&outFields=*&f=json";

export class TrafficService {
  private readonly CACHE_CONFIG = {
    maxAge: 2 * 60 * 1000, // 2 minutes for traffic data
    capacity: 50
  };

  private trafficCache: CacheManager<TrafficReport[]>;

  constructor() {
    this.trafficCache = new CacheManager(this.CACHE_CONFIG);
  }

  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 15000,
  };

  // Convert Israeli TM Grid coordinates to WGS84 (lat/lon)
  private convertCoordinates(x: number, y: number): { lat: number; lon: number } {
    // Simplified conversion for Israeli TM Grid (EPSG:2039) to WGS84
    // This is an approximation - for production use a proper coordinate transformation library
    const lat = 31.0 + (y - 500000) / 110000;
    const lon = 34.0 + (x - 200000) / 110000;
    
    return { lat, lon };
  }

  public async fetchTrafficReports(forceRefresh = false): Promise<TrafficReport[]> {
    if (!forceRefresh) {
      const cachedReports = this.trafficCache.get('traffic');
      if (cachedReports) return cachedReports;
    }

    try {
      const response = await axios.get(TRAFFIC_API_URL, this.axiosConfig);

      if (!response.data || !response.data.features || !Array.isArray(response.data.features)) {
        throw new Error("Invalid Traffic API response format");
      }

      const trafficData: TrafficApiResponse = response.data;
      
      const processedReports = trafficData.features
        .map((feature) => {
          const report = feature.attributes;
          
          // Convert coordinates
          const coords = this.convertCoordinates(feature.geometry.x, feature.geometry.y);
          
          // Validate coordinates
          if (coords.lat < 31 || coords.lat > 33 || coords.lon < 34 || coords.lon > 35) {
            return null;
          }

          const processedReport: TrafficReport = {
            ...report,
            geometry: feature.geometry,
            lat: coords.lat,
            lon: coords.lon,
            // Ensure required fields have default values
            street: report.street || 'Unknown Street',
            type: report.type || 'UNKNOWN',
            subtype: report.subtype || '',
            city: report.city || '',
          };

          return processedReport;
        })
        .filter((report): report is TrafficReport => report !== null);

      this.trafficCache.set('traffic', processedReports);
      
      // Cache in localStorage as backup
      try {
        localStorage.setItem("lastValidTrafficData", JSON.stringify(processedReports));
      } catch (err) {
        console.warn("Could not save traffic data to localStorage:", err);
      }

      return processedReports;
    } catch (error) {
      let errorMessage = "Unable to fetch traffic data from Tel Aviv API";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Tel Aviv Traffic API returned error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = "Unable to connect to Tel Aviv Traffic API - please check your internet connection";
        } else {
          errorMessage = `Request to Tel Aviv Traffic API failed: ${error.message}`;
        }
      }
      
      console.error("Error fetching traffic data:", errorMessage, error);
      
      // Try to return cached data as fallback
      const cachedReports = this.trafficCache.get('traffic');
      if (cachedReports) {
        console.log("Using cached traffic data as fallback");
        return cachedReports;
      }

      // Try localStorage backup
      try {
        const savedData = localStorage.getItem("lastValidTrafficData");
        if (savedData) {
          console.log("Using localStorage backup traffic data");
          return JSON.parse(savedData);
        }
      } catch (err) {
        console.warn("Could not load backup traffic data from localStorage:", err);
      }

      throw new Error(errorMessage);
    }
  }

  public clearCache(): void {
    this.trafficCache.clear();
    console.log("Traffic service cache cleared");
  }

  // Helper method to get report type color for UI
  public getReportTypeColor(type: string): string {
    switch (type?.toUpperCase()) {
      case 'JAM':
        return '#ff6b6b'; // Red for traffic jams
      case 'ROAD_CLOSED':
        return '#e74c3c'; // Dark red for road closures
      case 'HAZARD':
        return '#f39c12'; // Orange for hazards
      case 'ACCIDENT':
        return '#e67e22'; // Dark orange for accidents
      case 'POLICE':
        return '#3498db'; // Blue for police
      default:
        return '#95a5a6'; // Gray for unknown
    }
  }

  // Helper method to get report type icon
  public getReportTypeIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'JAM':
        return '🚗'; // Car for traffic jams
      case 'ROAD_CLOSED':
        return '🚧'; // Construction for road closures
      case 'HAZARD':
        return '⚠️'; // Warning for hazards
      case 'ACCIDENT':
        return '💥'; // Collision for accidents
      case 'POLICE':
        return '👮'; // Police officer
      default:
        return '📍'; // Pin for unknown
    }
  }

  // Helper method to get Hebrew type display
  public getTypeDisplayHebrew(type: string): string {
    switch (type?.toUpperCase()) {
      case 'JAM':
        return 'פקק תנועה';
      case 'ROAD_CLOSED':
        return 'כביש סגור';
      case 'HAZARD':
        return 'מפגע בדרך';
      case 'ACCIDENT':
        return 'תאונה';
      case 'POLICE':
        return 'משטרה';
      default:
        return 'דיווח תנועה';
    }
  }

  // Helper method to get English type display
  public getTypeDisplayEnglish(type: string): string {
    switch (type?.toUpperCase()) {
      case 'JAM':
        return 'Traffic Jam';
      case 'ROAD_CLOSED':
        return 'Road Closed';
      case 'HAZARD':
        return 'Road Hazard';
      case 'ACCIDENT':
        return 'Accident';
      case 'POLICE':
        return 'Police';
      default:
        return 'Traffic Report';
    }
  }
}