import axios from "axios";
import { CacheManager } from "../utils/CacheManager";
import {
  ParkingSpot,
  ParkingSpotWithStatus,
  GISApiResponse,
} from "../Types/parking";

const GIS_API_URL = "/api/arcgis/rest/services/IView2/MapServer/970/query?where=1%3D1&outFields=*&f=json";

export class ParkingService {
  private readonly CACHE_CONFIG = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    capacity: 100
  };

  private spotsCache: CacheManager<ParkingSpotWithStatus[]>;

  constructor() {
    this.spotsCache = new CacheManager(this.CACHE_CONFIG);
  }

  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 15000, // Increased timeout for GIS API
  };

  public async fetchParkingSpots(forceRefresh = false): Promise<ParkingSpotWithStatus[]> {
    if (!forceRefresh) {
      const cachedSpots = this.spotsCache.get('spots');
      if (cachedSpots) return cachedSpots;
    }

    try {
      const response = await axios.get(GIS_API_URL, this.axiosConfig);

      if (!response.data || !response.data.features || !Array.isArray(response.data.features)) {
        throw new Error("Invalid GIS API response format");
      }

      const gisData: GISApiResponse = response.data;
      
      const processedSpots = gisData.features
        .map((feature) => {
          const spot = feature.attributes;
          
          // Validate coordinates
          if (!spot.lat || !spot.lon || 
              isNaN(spot.lat) || isNaN(spot.lon) ||
              spot.lat < 31 || spot.lat > 33 ||
              spot.lon < 34 || spot.lon > 35) {
            return null;
          }

          // Process the spot data
          const processedSpot: ParkingSpotWithStatus = {
            ...spot,
            geometry: feature.geometry,
            // Ensure required fields have default values
            shem_chenyon: spot.shem_chenyon || 'Unknown',
            ktovet: spot.ktovet || 'Unknown Address',
            status_chenyon: spot.status_chenyon || 'Unknown',
            taarif_yom: spot.taarif_yom || 'No pricing information',
            hearot_taarif: spot.hearot_taarif || '',
          };

          return processedSpot;
        })
        .filter((spot): spot is ParkingSpotWithStatus => spot !== null);

      if (processedSpots.length === 0) {
        throw new Error("No valid parking spots found in GIS data");
      }

      this.spotsCache.set('spots', processedSpots);
      
      // Cache in localStorage as backup
      try {
        localStorage.setItem("lastValidParkingData", JSON.stringify(processedSpots));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      return processedSpots;
    } catch (error) {
      let errorMessage = "Unable to fetch parking data from Tel Aviv GIS API";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Tel Aviv GIS API returned error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = "Unable to connect to Tel Aviv GIS API - please check your internet connection";
        } else {
          errorMessage = `Request to Tel Aviv GIS API failed: ${error.message}`;
        }
      }
      
      console.error("Error fetching parking data:", errorMessage, error);
      
      // Try to return cached data as fallback
      const cachedSpots = this.spotsCache.get('spots');
      if (cachedSpots) {
        console.log("Using cached data as fallback");
        return cachedSpots;
      }

      // Try localStorage backup
      try {
        const savedData = localStorage.getItem("lastValidParkingData");
        if (savedData) {
          console.log("Using localStorage backup data");
          return JSON.parse(savedData);
        }
      } catch (err) {
        console.warn("Could not load backup data from localStorage:", err);
      }

      throw new Error(errorMessage);
    }
  }

  // Legacy method for compatibility - now just calls fetchParkingSpots
  public async fetchParkingStatus(forceRefresh = false): Promise<Map<string, any>> {
    // Status is now included in the main data, so we return an empty map
    return new Map();
  }

  // Legacy method for compatibility - data is already combined
  public combineParkingData(
    spots: ParkingSpot[],
    statusMap: Map<string, any>
  ): ParkingSpotWithStatus[] {
    // Data is already combined in the new API
    return spots as ParkingSpotWithStatus[];
  }

  public clearCache(): void {
    this.spotsCache.clear();
    console.log("Parking service cache cleared");
  }

  // Helper method to get status color for UI
  public getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status?.toLowerCase()) {
      case 'פנוי':
        return 'success';
      case 'מעט':
        return 'warning';
      case 'מלא':
        return 'error';
      case 'סגור':
        return 'error';
      case 'פעיל':
        return 'success';
      default:
        return 'default';
    }
  }

  // Helper method to get status display text
  public getStatusDisplay(status: string): string {
    if (!status || status.trim() === '') {
      return 'Status unavailable';
    }
    return status;
  }
}