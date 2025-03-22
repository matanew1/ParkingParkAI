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
}

export class RouteService {
  private readonly BASE_URL = "https://valhalla1.openstreetmap.de/route";

  async fetchRoute(
    start: Coordinates | string,
    end: Coordinates | string,
    options: RouteOptions = {}
  ): Promise<Route> {
    const axiosConfig = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    try {
      // Parse coordinates consistently
      const startCoords =
        typeof start === "string"
          ? (start.split(",").map((part) => parseFloat(part)) as Coordinates)
          : start;

      const endCoords =
        typeof end === "string"
          ? (end.split(",").map((part) => parseFloat(part)) as Coordinates)
          : end;

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

      console.log("Route fetch response:", response.data);
      if (!response.data.trip) {
        throw new Error("No route found.");
      }

      return response.data.trip;
    } catch (error) {
      console.error("Route fetch error:", error);
      throw new Error(
        "Unable to load route information. Please try again later."
      );
    }
  }

  // Helper method to decode the polyline shape returned by the API
  decodeShape(shape: string): Coordinates[] {
    // This is a simplified implementation of Valhalla's polyline decoder
    // For production use, you would need a full implementation of the polyline algorithm
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
}
