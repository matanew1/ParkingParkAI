import axios from "axios";
import proj4 from 'proj4';
import { CacheManager } from "../utils/CacheManager";
import { SpatialCacheManager } from "../utils/SpatialCacheManager";
import { RateLimiter } from "../utils/debounceThrottle";
import {
  ParkingSpot,
  ParkingSpotWithStatus,
  GISApiResponse,
} from "../Types/parking";

// Define the Israel Transverse Mercator projection (EPSG:2039)
proj4.defs("EPSG:2039", "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs");



export class ParkingService {
  private readonly CACHE_CONFIG = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    capacity: 100
  };

  private spotsCache: CacheManager<ParkingSpotWithStatus[]>;
  private spatialCache: SpatialCacheManager;
  private rateLimiter: RateLimiter;

  constructor() {
    this.spotsCache = new CacheManager(this.CACHE_CONFIG);
    this.spatialCache = new SpatialCacheManager();
    this.rateLimiter = new RateLimiter(500, 10000); // Min 500ms between calls, max 10s backoff
    // Load existing spatial cache on initialization
    this.spatialCache.loadFromLocalStorage();
  }

  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 15000, // Increased timeout for GIS API
  };

  // Helper method for coordinate conversion from Israel TM Grid to WGS84
  private convertITMtoWGS84(x: number, y: number): [number, number] | null {
    try {
      const wgs84Point = proj4("EPSG:2039", "WGS84", [x, y]);
      const lon = wgs84Point[0];
      const lat = wgs84Point[1];
      
      // Validate converted coordinates are in reasonable range for Israel
      if (lat < 31 || lat > 33.5 || lon < 34 || lon > 35.5) {
        console.warn(`Converted coordinates outside expected range: lat=${lat}, lon=${lon} from original x=${x}, y=${y}`);
        return null;
      }
      
      return [lon, lat];
    } catch (error) {
      console.error(`Error converting coordinates x=${x}, y=${y}:`, error);
      return null;
    }
  }

  public async fetchParkingSpots(url: string, type: string, forceRefresh = false): Promise<ParkingSpotWithStatus[]> {
    const cacheKey = `spots_${type}`;
    
    if (!forceRefresh) {
      const cachedSpots = this.spotsCache.get(cacheKey);
      if (cachedSpots) return cachedSpots;
    }

    try {
      // Use rate limiter for API calls
      const response = await this.rateLimiter.execute(() => 
        axios.get(url, this.axiosConfig)
      );

      if (!response.data || !response.data.features || !Array.isArray(response.data.features)) {
        throw new Error("Invalid GIS API response format");
      }

      const gisData: GISApiResponse = response.data;

      const processedSpots = gisData.features
        .map((feature) => {
          const spot = feature.attributes;

          console.log(url + " Processing GIS feature:", spot);

          if (type === "public") {
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
              // Create unique ID by prefixing with data source type
              code_achoza: `public_${spot.code_achoza}`,
              UniqueId: `public_${spot.code_achoza}_${spot.oid_hof || 'unknown'}`,
              // Ensure required fields have default values
              shem_chenyon: spot.shem_chenyon || 'Unknown',
              ktovet: spot.ktovet || 'Unknown Address',
              status_chenyon: spot.status_chenyon || 'Unknown',
              taarif_yom: spot.taarif_yom || 'No pricing information',
              hearot_taarif: spot.hearot_taarif || '',
            };

            return processedSpot;
          } else if (type === "private") {
            // Private parking uses different coordinate field names
            const xCoord = spot.x_coord || spot.x;
            const yCoord = spot.y_coord || spot.y;
            
            // Validate coordinates - these are in Israel TM Grid coordinates (EPSG:2039)
            if (!xCoord || !yCoord ||
                isNaN(xCoord) || isNaN(yCoord)) {
              return null;
            }

            // Convert from Israel TM Grid (EPSG:2039) to WGS84
            const wgs84Coords = this.convertITMtoWGS84(xCoord, yCoord);
            if (!wgs84Coords) {
              return null;
            }
            
            const [lon, lat] = wgs84Coords;
            
            console.log(`Converted private parking coordinates: ITM(${xCoord}, ${yCoord}) -> WGS84(${lon.toFixed(6)}, ${lat.toFixed(6)})`);

            // Process the spot data with proper field mapping
            const processedSpot: ParkingSpotWithStatus = {
              ...spot,
              geometry: feature.geometry,
              // Create unique identifiers
              code_achoza: `private_${spot.oid_han || spot.UniqueId}`,
              UniqueId: `private_${spot.UniqueId || spot.oid_han}`,
              oid_hof: spot.oid_han || 0,
              // Map coordinates
              lat: lat,
              lon: lon,
              x: xCoord,
              y: yCoord,
              // Map private parking fields to standard fields
              shem_chenyon: spot.shem_baal_chechbon || 'Private Parking',
              ktovet: spot.shem_rechov || 'Unknown Address',
              status_chenyon: spot.t_shimush || 'Unknown',
              taarif_yom: 'Private parking - contact owner',
              hearot_taarif: `Area: ${spot.shetach_arnona || 'N/A'} sqm`,
              // Keep original private fields
              shem_baal_chechbon: spot.shem_baal_chechbon,
              shem_rechov: spot.shem_rechov,
              t_shimush: spot.t_shimush,
              shetach_arnona: spot.shetach_arnona,
              num_cley_rechev: spot.num_cley_rechev,
              oid_han: spot.oid_han,
            };

            return processedSpot;
          }

        })
        .filter((spot): spot is ParkingSpotWithStatus => spot !== null);

      if (processedSpots.length === 0) {
        throw new Error("No valid parking spots found in GIS data");
      }

      this.spotsCache.set(cacheKey, processedSpots);
      
      // Cache in localStorage as backup
      try {
        localStorage.setItem(`lastValidParkingData_${type}`, JSON.stringify(processedSpots));
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
      const cachedSpots = this.spotsCache.get(cacheKey);
      if (cachedSpots) {
        console.log("Using cached data as fallback");
        return cachedSpots;
      }

      // Try localStorage backup
      try {
        const savedData = localStorage.getItem(`lastValidParkingData_${type}`);
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
    this.spatialCache.clear();
    console.log("Parking service cache cleared");
  }

  // Get cached data for specific viewport bounds
  public getCachedViewportData(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoomLevel: number): ParkingSpotWithStatus[] | null {
    return this.spatialCache.getCachedData(bounds, zoomLevel);
  }

  // Cache data for specific viewport bounds
  public setCachedViewportData(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoomLevel: number, data: ParkingSpotWithStatus[]): void {
    this.spatialCache.setCachedData(bounds, zoomLevel, data);
  }

  // Get cache statistics for monitoring
  public getCacheStats(): any {
    return {
      regular: {
        size: 'N/A', // CacheManager doesn't expose size
        capacity: this.CACHE_CONFIG.capacity
      },
      spatial: this.spatialCache.getStats()
    };
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