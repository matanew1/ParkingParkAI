import axios from "axios";

export type Coordinates = [number, number];
export type Route = Array<Coordinates>;

export type CostingModel =
  | "auto"
  | "bicycle"
  | "pedestrian"
  | "truck"
  | "motorcycle"
  | "bus";

export interface RouteOptions {
  shortest?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  preferenceLevel?: number;
  costing?: CostingModel;
}

export interface TripSummary {
  length: number; // in kilometers
  time: number; // in seconds
}

export interface TripLeg {
  summary: TripSummary;
  shape: string;
}

export interface Trip {
  legs: TripLeg[];
  summary: TripSummary;
}

export class RouteService {
  private readonly BASE_URL = "https://valhalla1.openstreetmap.de/route";
  private readonly cache = new Map<string, Trip>();

  // Helper to normalize coordinates for consistent caching
  private normalizeCoordinates(coord: Coordinates | string): Coordinates {
    if (typeof coord === "string") {
      return coord.split(",").map((part) => parseFloat(part)) as Coordinates;
    }
    return coord;
  }

  // Generate a cache key based on start, end, and options
  private getCacheKey(
    start: Coordinates,
    end: Coordinates,
    options: RouteOptions
  ): string {
    return `${start.join(",")}_${end.join(",")}_${JSON.stringify(options)}`;
  }

  /**
   * Fetches a route between two points with caching
   * @param start Starting coordinates or string ("lat,lng")
   * @param end Ending coordinates or string ("lat,lng")
   * @param options Routing options
   * @returns Promise with trip data
   */
  public async fetchRoute(
    start: Coordinates | string,
    end: Coordinates | string,
    options: RouteOptions = {}
  ): Promise<Trip> {
    // Normalize coordinates for consistency
    const startCoords = this.normalizeCoordinates(start);
    const endCoords = this.normalizeCoordinates(end);

    // Check cache first
    const cacheKey = this.getCacheKey(startCoords, endCoords, options);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      console.log("Route cache hit:", cacheKey);
      return cachedResult;
    }

    const axiosConfig = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 15000, // 15 second timeout
    };

    try {
      // Build costing options based on user preferences
      const costingOptions: Record<string, unknown> = {};

      if (options.avoidTolls !== undefined) {
        costingOptions.use_tolls = options.avoidTolls
          ? 0
          : options.preferenceLevel || 1;
      }

      if (options.avoidHighways !== undefined) {
        costingOptions.use_highways = options.avoidHighways
          ? 0
          : options.preferenceLevel || 1;
      }

      if (options.avoidFerries !== undefined) {
        costingOptions.use_ferry = options.avoidFerries
          ? 0
          : options.preferenceLevel || 1;
      }

      // Build the complete request body
      const body = {
        locations: [
          { lat: startCoords[0], lon: startCoords[1] },
          { lat: endCoords[0], lon: endCoords[1] },
        ],
        costing: options.costing || "auto",
        costing_options:
          Object.keys(costingOptions).length > 0
            ? { [options.costing || "auto"]: costingOptions }
            : undefined,
        directions_options: { units: "km" },
        ...(options.shortest && { shortest: true }),
      };

      const response = await axios.post(this.BASE_URL, body, axiosConfig);

      if (!response.data.trip) {
        throw new Error("No route found.");
      }

      // Process the route data
      const route = response.data.trip;
      const trip: Trip = {
        legs: route.legs.map((leg: any) => ({
          summary: {
            length: leg.summary.length,
            time: leg.summary.time,
          },
          shape: leg.shape,
        })),
        summary: {
          length: route.summary.length,
          time: route.summary.time,
        },
      };

      // Cache the result
      this.cache.set(cacheKey, trip);

      // Return decoded route
      if (trip.legs[0].shape) {
        const coordinates = this.decodeShape(trip.legs[0].shape);
        trip.legs[0].coordinates = coordinates;
      }

      return trip;
    } catch (error) {
      console.error("Route fetch error:", error);
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        throw new Error("Route calculation timed out. Please try again.");
      }
      throw new Error(
        "Unable to load route information. Please try again later."
      );
    }
  }

  /**
   * Decodes the polyline shape returned by the API
   * @param shape Encoded polyline string
   * @returns Array of coordinates
   */
  public decodeShape(shape: string): Coordinates[] {
    const coordinates: Coordinates[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < shape.length) {
      let result = 1;
      let shift = 0;
      let b: number;

      // Decode latitude
      do {
        b = shape.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);

      lat += result & 1 ? ~(result >> 1) : result >> 1;

      // Decode longitude
      result = 1;
      shift = 0;

      do {
        b = shape.charCodeAt(index++) - 63 - 1;
        result += b << shift;
        shift += 5;
      } while (b >= 0x1f);

      lng += result & 1 ? ~(result >> 1) : result >> 1;

      // Convert to actual coordinates
      coordinates.push([lat * 1e-6, lng * 1e-6]);
    }

    return coordinates;
  }

  /**
   * Clears the route cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}
