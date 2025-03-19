// src/types/parking.ts
export interface ParkingSpot {
  AhuzotCode: string;
  Name: string;
  Address: string;
  GPSLattitude: string;
  GPSLongitude: string;
  DaytimeFee?: string;
  FeeComments?: string;
}

export interface ParkingStatus {
  AhuzotCode: string;
  InformationToShow: string;
  LastUpdateFromDambach: string;
}

export interface ParkingSpotWithStatus extends ParkingSpot {
  status?: ParkingStatus;
}

export interface SidebarProps {
  spots: ParkingSpotWithStatus[];
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  statusError: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}