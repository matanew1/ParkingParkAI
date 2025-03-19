export interface ParkingSpot {
  AhuzotCode: string;
  ControllerID: string;
  Name: string;
  Address: string;
  GPSLattitude: string;
  GPSLongitude: string;
  DaytimeFee: string;
  DaytimeFeeWindow: string | null;
  NighttimeFee: string | null;
  NighttimeFeeWindow: string | null;
  DailyFee: string | null;
  DailyFeeWindow: string | null;
  MonthFeeForDailySubscriber: string | null;
  MonthFeeForDailySubscriberWindow: string | null;
  MonthFeeForNightlySubscriber: string | null;
  MonthFeeForNightlySubscriberWindow: string | null;
  FeeComments: string;
  OpenWindow: string | null;
  MaximumPublicOccupancy: string;
  MaximumSubscriberOccupancy: string;
  Extra01: string | null;
  Extra02: string | null;
  Extra03: string | null;
  Extra04: string | null;
  Extra05: string | null;
}

export interface ParkingStatus {
  AhuzotCode: string;
  Name: string;
  InformationToShow: string;
  LastUpdateFromDambach: string;
}

export interface ParkingSpotWithStatus extends ParkingSpot {
  status?: ParkingStatus;
}