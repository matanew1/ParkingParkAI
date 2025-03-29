// src/Services/parkingService.ts
import axios from "axios";
import {
  ParkingSpot,
  ParkingStatus,
  ParkingSpotWithStatus,
} from "../types/parking";

const API_BASE_URL = "https://api.tel-aviv.gov.il/parking";

export class ParkingService {
  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  public async fetchParkingSpots(): Promise<ParkingSpot[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stations`,
        this.axiosConfig
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid parking spots data format");
      }

      return response.data.filter((spot: ParkingSpot) => {
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
    } catch {
      throw new Error("Status information is temporarily unavailable");
    }
  }

  public async fetchParkingStatus(): Promise<Map<string, ParkingStatus>> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/StationsStatus`,
        this.axiosConfig
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid parking status data format");
      }

      return new Map(
        response.data.map((status: ParkingStatus) => [
          status.AhuzotCode,
          status,
        ])
      );
    } catch {
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
}
