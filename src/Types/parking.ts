// src/types/parking.ts
export interface ParkingSpot {
  oid_hof: number;
  rowid: number;
  code_achoza: number;
  ControllerID: number;
  shem_chenyon: string;
  ktovet: string;
  lon: number;
  lat: number;
  taarif_yom: string;
  chalon_taarif_yom: string;
  taarif_layla: string;
  chalon_zman_taarif_layla: string;
  taarif_yomi: string;
  chalon_zman_taarif_yomi: string;
  taarif_yom_manuy_chodshi: string;
  chalon_zman_yom_taarif_yomi: string;
  taarif_layla_manuy_chodshi: string;
  chalon_zman_layal_taarif_yomi: string;
  hearot_taarif: string;
  chalon_zman_chenyon_patoach: string;
  mispar_mekomot_bchenyon: number;
  mispar_mekomot_manuy_bchenyon: number;
  status_chenyon: string;
  tr_status_chenyon: number;
  y: number;
  x: number;
  UniqueId: string;
  date_import: string | null;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface GISApiResponse {
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
    attributes: ParkingSpot;
    geometry: {
      x: number;
      y: number;
    };
  }>;
}

export interface ParkingSpotWithStatus extends ParkingSpot {
  // All status information is now included in the main data
}

export interface SidebarProps {
  spots: ParkingSpotWithStatus[];
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  onSpotSelect: (spotId: string | null) => void;
  statusError: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  toggleDrawer: () => void;
  isMobile: boolean;
}

export interface ParkingListProps {
  filteredSpots: ParkingSpotWithStatus[];
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  onSpotSelect: (spotId: string | null) => void;
  toggleDrawer: () => void;
  isMobile: boolean;
}