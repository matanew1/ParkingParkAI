// src/services/parkingService.ts
import axios from 'axios';
import { ParkingSpot, ParkingStatus, ParkingSpotWithStatus } from '../types/parking';

const API_BASE_URL = 'https://api.tel-aviv.gov.il/parking';

export const fetchParkingSpots = async (): Promise<ParkingSpot[]> => {
  const axiosConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.get(`${API_BASE_URL}/stations`, axiosConfig);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid parking spots data format');
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
  } catch (error) {
    throw new Error('Unable to load parking locations. Please try again later.');
  }
};

export const fetchParkingStatus = async (): Promise<Map<string, ParkingStatus>> => {
  const axiosConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.get(`${API_BASE_URL}/StationsStatus`, axiosConfig);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid parking status data format');
    }
    
    return new Map(
      response.data.map((status: ParkingStatus) => [
        status.AhuzotCode,
        status,
      ])
    );
  } catch (error) {
    throw new Error('Status information is temporarily unavailable');
  }
};

export const combineParkingData = (
  spots: ParkingSpot[], 
  statusMap: Map<string, ParkingStatus>
): ParkingSpotWithStatus[] => {
  return spots.map((spot: ParkingSpot) => ({
    ...spot,
    status: statusMap.get(spot.AhuzotCode),
  }));
};