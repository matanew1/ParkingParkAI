import axios from "axios";
import proj4 from "proj4";
import { CacheManager } from "../utils/CacheManager";
import { RateLimiter } from "../utils/debounceThrottle";
import { validateCoordinateWithLogging } from "../utils/coordinateValidation";
import { ParkingSpotWithStatus, GISApiResponse } from "../Types/parking";

// Define the Israel Transverse Mercator projection (EPSG:2039)
proj4.defs(
  "EPSG:2039",
  "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs"
);

export class ParkingService {
  private readonly CACHE_CONFIG = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    capacity: 100,
  };

  private spotsCache: CacheManager<ParkingSpotWithStatus[]>;
  private rateLimiter: RateLimiter;

  constructor() {
    this.spotsCache = new CacheManager(this.CACHE_CONFIG);
    this.rateLimiter = new RateLimiter(500, 10000); // Min 500ms between calls, max 10s backoff
  }

  private axiosConfig = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // Safari sometimes needs explicit no-cache
      "Cache-Control": "no-cache",
    },
    timeout: 20000, // Increased timeout for GIS API (Safari can be slower)
    withCredentials: false,
    // Disable credentials for CORS
    xsrfCookieName: undefined,
    xsrfHeaderName: undefined,
  };

  // Helper method for coordinate conversion from Israel TM Grid to WGS84
  private convertITMtoWGS84(x: number, y: number): [number, number] | null {
    try {
      const wgs84Point = proj4("EPSG:2039", "WGS84", [x, y]);
      const lon = wgs84Point[0];
      const lat = wgs84Point[1];

      // Validate converted coordinates are in reasonable range for Israel
      if (lat < 31 || lat > 33.5 || lon < 34 || lon > 35.5) {
        console.warn(
          `Converted coordinates outside expected range: lat=${lat}, lon=${lon} from original x=${x}, y=${y}`
        );
        return null;
      }

      return [lon, lat];
    } catch (error) {
      console.error(`Error converting coordinates x=${x}, y=${y}:`, error);
      return null;
    }
  }

  // Helper method to process a single GIS feature into ParkingSpotWithStatus
  private processFeature(
    feature: any,
    type: string
  ): ParkingSpotWithStatus | null {
    const spot = feature.attributes;

    if (type === "public") {
      // Enhanced coordinate validation using centralized utility
      if (
        !spot.lat ||
        !spot.lon ||
        !validateCoordinateWithLogging(spot.lat, spot.lon, "Public parking spot")
      ) {
        return null;
      }

      const processedSpot: ParkingSpotWithStatus = {
        ...spot,
        geometry: feature.geometry,
        // Create unique ID by prefixing with data source type
        code_achoza: `public_${spot.code_achoza}`,
        UniqueId: `public_${spot.code_achoza}_${spot.oid_hof || "unknown"}`,
        // Ensure required fields have default values
        shem_chenyon: spot.shem_chenyon || "Unknown",
        ktovet: spot.ktovet || "Unknown Address",
        status_chenyon: spot.status_chenyon || "Unknown",
        taarif_yom: spot.taarif_yom || "No pricing information",
        hearot_taarif: spot.hearot_taarif || "",
      };

      return processedSpot;
    } else if (type === "private") {
      // Private parking uses different coordinate field names
      const xCoord = spot.x_coord || spot.x;
      const yCoord = spot.y_coord || spot.y;

      // Validate coordinates - these are in Israel TM Grid coordinates (EPSG:2039)
      if (!xCoord || !yCoord || isNaN(xCoord) || isNaN(yCoord)) {
        return null;
      }

      // Convert from Israel TM Grid (EPSG:2039) to WGS84
      const wgs84Coords = this.convertITMtoWGS84(xCoord, yCoord);
      if (!wgs84Coords) {
        console.warn(
          `Failed to convert private spot coordinates: ITM(${xCoord}, ${yCoord})`
        );
        return null;
      }

      const [lon, lat] = wgs84Coords;

      // Additional validation of converted coordinates using centralized utility
      if (
        !validateCoordinateWithLogging(
          lat,
          lon,
          `Private parking spot (converted from ITM(${xCoord}, ${yCoord}))`
        )
      ) {
        return null;
      }

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
        shem_chenyon: spot.shem_baal_chechbon || "Private Parking",
        ktovet: spot.shem_rechov || "Unknown Address",
        status_chenyon: spot.t_shimush || "Unknown",
        taarif_yom: "Private parking - contact owner",
        hearot_taarif: `Area: ${spot.shetach_arnona || "N/A"} sqm`,
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

    return null;
  }

  public async fetchParkingSpots(
    url: string,
    type: string,
    forceRefresh = false,
    fallbackUrl?: string
  ): Promise<ParkingSpotWithStatus[]> {
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

      if (
        !response.data ||
        !response.data.features ||
        !Array.isArray(response.data.features)
      ) {
        throw new Error("Invalid GIS API response format");
      }

      const gisData: GISApiResponse = response.data;

      const processedSpots = gisData.features
        .map((feature) => this.processFeature(feature, type))
        .filter((spot): spot is ParkingSpotWithStatus => spot !== null);

      if (processedSpots.length === 0) {
        throw new Error("No valid parking spots found in GIS data");
      }

      this.spotsCache.set(cacheKey, processedSpots);

      // Cache in localStorage as backup
      try {
        localStorage.setItem(
          `lastValidParkingData_${type}`,
          JSON.stringify(processedSpots)
        );
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      return processedSpots;
    } catch (error) {
      let errorMessage = "Unable to fetch parking data from Tel Aviv GIS API";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          errorMessage = `API Error ${error.response.status}: Please try again later`;
          if (error.response.status === 429) {
            errorMessage = "Too many requests. Please wait a moment and try again.";
          } else if (error.response.status >= 500) {
            errorMessage = "Server is temporarily unavailable. Please try again later.";
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage =
            "Unable to connect to the GIS server. Check your internet connection.";
        } else {
          // Error in request setup
          errorMessage = `Network error: ${error.message}`;
        }
      }

      console.error("Error fetching parking data from primary URL:", errorMessage, error);

      // Try fallback URL if available (for Safari/mobile compatibility)
      if (fallbackUrl && fallbackUrl !== url) {
        console.log("Attempting fallback URL for", type, "parking data");
        try {
          const fallbackResponse = await this.rateLimiter.execute(() =>
            axios.get(fallbackUrl, this.axiosConfig)
          );

          if (
            fallbackResponse.data &&
            fallbackResponse.data.features &&
            Array.isArray(fallbackResponse.data.features)
          ) {
            console.log("Fallback URL successful, processing data...");
            // Process the response - reuse the same processing logic
            const gisData: GISApiResponse = fallbackResponse.data;
            
            // We'll return early with fallback data
            const processedSpots = gisData.features
              .map((feature) => this.processFeature(feature, type))
              .filter((spot): spot is ParkingSpotWithStatus => spot !== null);

            if (processedSpots.length > 0) {
              this.spotsCache.set(cacheKey, processedSpots);
              try {
                localStorage.setItem(
                  `lastValidParkingData_${type}`,
                  JSON.stringify(processedSpots)
                );
              } catch (err) {
                console.warn("Could not save to localStorage:", err);
              }
              return processedSpots;
            }
          }
        } catch (fallbackError) {
          console.error("Fallback URL also failed:", fallbackError);
        }
      }

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
}
