// src/types/traffic.ts
export interface TrafficReport {
  OBJECTID: number;
  country: string;
  nThumbsUp: number;
  city: string;
  reportRating: number;
  reportByMunicipalityUser: string;
  confidence: number;
  reliability: number;
  type: string;
  uuid: string;
  roadType: number;
  magvar: number;
  subtype: string;
  street: string;
  pubMillis: string;
  updateDate: number;
  geometry?: {
    x: number;
    y: number;
  };
  // Computed fields
  lat?: number;
  lon?: number;
}

export interface TrafficApiResponse {
  displayFieldName: string;
  fieldAliases: Record<string, string>;
  geometryType: string;
  spatialReference: {
    wkid: number;
    latestWkid: number;
  };
  fields: Array<{
    name: string;
    type: string;
    alias: string;
    length?: number;
  }>;
  features: Array<{
    attributes: TrafficReport;
    geometry: {
      x: number;
      y: number;
    };
  }>;
}

export interface TrafficContextType {
  trafficReports: TrafficReport[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshing: boolean;
  showTrafficReports: boolean;
  fetchTrafficData: (isManualRefresh?: boolean) => Promise<void>;
  setShowTrafficReports: (show: boolean) => void;
}