import axios from "axios";
import { CacheManager } from "../utils/CacheManager";
import {
  ParkingSpot,
  ParkingStatus,
  ParkingSpotWithStatus,
} from "../Types/parking";

const API_BASE_URL = "https://api.tel-aviv.gov.il/parking";

export class ParkingService {
  private readonly CACHE_CONFIG = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    capacity: 100
  };

  private spotsCache: CacheManager<ParkingSpot[]>;
  private statusCache: CacheManager<Map<string, ParkingStatus>>;

  constructor() {
    this.spotsCache = new CacheManager(this.CACHE_CONFIG);
    this.statusCache = new CacheManager(this.CACHE_CONFIG);
  }

  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 10000,
  };

  public async fetchParkingSpots(forceRefresh = false): Promise<ParkingSpot[]> {
    if (!forceRefresh) {
      const cachedSpots = this.spotsCache.get('spots');
      if (cachedSpots) return cachedSpots;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/stations`,
        this.axiosConfig
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid parking spots data format");
      }

      const filteredSpots = response.data.filter((spot: ParkingSpot) => {
        const lat = parseFloat(spot.GPSLattitude);
        const lng = parseFloat(spot.GPSLongitude);
        return (
          spot.GPSLattitude &&
          spot.GPSLongitude &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= 31 &&
          lat <= 33 &&
          lng >= 34 &&
          lng <= 35
        );
      });

      this.spotsCache.set('spots', filteredSpots);
      return filteredSpots;
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      const cachedSpots = this.spotsCache.get('spots');
      if (cachedSpots) {
        console.log("Using cached data as fallback");
        return cachedSpots;
      }
      throw new Error("Unable to fetch parking stations");
    }
  }

  public async fetchParkingStatus(forceRefresh = false): Promise<Map<string, ParkingStatus>> {
    if (!forceRefresh) {
      const cachedStatus = this.statusCache.get('status');
      if (cachedStatus) return cachedStatus;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/StationsStatus`,
        this.axiosConfig
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid parking status data format");
      }

      const statusMap = new Map(
        response.data.map((status: ParkingStatus) => [
          status.AhuzotCode,
          status,
        ])
      );

      this.statusCache.set('status', statusMap);
      localStorage.setItem(
        "lastValidStatus",
        JSON.stringify(Array.from(statusMap.entries()))
      );

      return statusMap;
    } catch (error) {
      console.error("Error fetching parking status:", error);
      
      const cachedStatus = this.statusCache.get('status');
      if (cachedStatus) return cachedStatus;

      try {
        const savedStatus = localStorage.getItem("lastValidStatus");
        if (savedStatus) {
          return new Map(JSON.parse(savedStatus));
        }
      } catch (err) {
        console.warn("Could not load status from localStorage:", err);
      }

      throw new Error("Status information is temporarily unavailable");
    }
  }

  public combineParkingData(
    spots: ParkingSpot[],
    statusMap: Map<string, ParkingStatus>
  ): ParkingSpotWithStatus[] {
    return spots.map((spot: ParkingSpot) => ({
      ...spot,
      status: statusMap.get(spot.AhuzotCode),
    }));
  }

  public clearCache(): void {
    this.spotsCache.clear();
    this.statusCache.clear();
    console.log("Parking service cache cleared");
  }
}