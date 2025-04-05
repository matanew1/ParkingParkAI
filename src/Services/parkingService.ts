// src/Services/parkingService.ts
import axios from "axios";
import {
  ParkingSpot,
  ParkingStatus,
  ParkingSpotWithStatus,
} from "../Types/parking";

const API_BASE_URL = "https://api.tel-aviv.gov.il/parking";

/**
 * Service for fetching and managing parking data
 */
export class ParkingService {
  // Cache duration in milliseconds (5 minutes)
  private CACHE_DURATION = 5 * 60 * 1000;

  // Cache for parking spots data
  private spotsCache: {
    data: ParkingSpot[] | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0,
  };

  // Cache for parking status data
  private statusCache: {
    data: Map<string, ParkingStatus> | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0,
  };

  // Default axios config
  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
  };

  /**
   * Fetches parking spots with caching
   * @param forceRefresh Whether to bypass cache
   * @returns Promise with parking spots array
   */
  public async fetchParkingSpots(forceRefresh = false): Promise<ParkingSpot[]> {
    const now = Date.now();
    const isCacheValid =
      this.spotsCache.data &&
      !forceRefresh &&
      now - this.spotsCache.timestamp < this.CACHE_DURATION;

    if (isCacheValid) {
      console.log("Using cached parking spots data");
      return this.spotsCache.data;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/stations`,
        this.axiosConfig
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid parking spots data format");
      }

      // Filter out spots with invalid coordinates
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

      // Update cache
      this.spotsCache = {
        data: filteredSpots,
        timestamp: now,
      };

      return filteredSpots;
    } catch (error) {
      console.error("Error fetching parking spots:", error);

      // If we have cached data but it's expired, return it as fallback
      if (this.spotsCache.data) {
        console.log("Using expired cache as fallback");
        return this.spotsCache.data;
      }

      throw new Error(
        "Unable to fetch parking stations. Please try again later."
      );
    }
  }

  /**
   * Fetches parking status with caching
   * @param forceRefresh Whether to bypass cache
   * @returns Promise with parking status map
   */
  public async fetchParkingStatus(
    forceRefresh = false
  ): Promise<Map<string, ParkingStatus>> {
    const now = Date.now();
    const isCacheValid =
      this.statusCache.data &&
      !forceRefresh &&
      now - this.statusCache.timestamp < this.CACHE_DURATION;

    if (isCacheValid) {
      console.log("Using cached parking status data");
      return this.statusCache.data;
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

      // Store last valid status in localStorage for offline fallback
      if (statusMap.size > 0) {
        try {
          localStorage.setItem(
            "lastValidStatus",
            JSON.stringify(Array.from(statusMap.entries()))
          );
        } catch (err) {
          console.warn("Could not save status to localStorage:", err);
        }
      }

      // Update cache
      this.statusCache = {
        data: statusMap,
        timestamp: now,
      };

      return statusMap;
    } catch (error) {
      console.error("Error fetching parking status:", error);

      // If we have cached data but it's expired, return it as fallback
      if (this.statusCache.data) {
        console.log("Using expired cache as fallback");
        return this.statusCache.data;
      }

      // Try to load from localStorage as last resort
      try {
        const savedStatus = localStorage.getItem("lastValidStatus");
        if (savedStatus) {
          const parsedStatus = JSON.parse(savedStatus);
          console.log("Using localStorage backup for status");
          return new Map(parsedStatus);
        }
      } catch (err) {
        console.warn("Could not load status from localStorage:", err);
      }

      throw new Error("Status information is temporarily unavailable");
    }
  }

  /**
   * Combines parking spots with their status
   * @param spots Array of parking spots
   * @param statusMap Map of status by spot ID
   * @returns Array of spots with status
   */
  public combineParkingData(
    spots: ParkingSpot[],
    statusMap: Map<string, ParkingStatus>
  ): ParkingSpotWithStatus[] {
    return spots.map((spot: ParkingSpot) => ({
      ...spot,
      status: statusMap.get(spot.AhuzotCode),
    }));
  }

  /**
   * Clears all caches
   */
  public clearCache(): void {
    this.spotsCache = { data: null, timestamp: 0 };
    this.statusCache = { data: null, timestamp: 0 };
    console.log("Parking service cache cleared");
  }
}
