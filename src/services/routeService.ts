import axios from "axios";

export type Coordinates = [number, number];
export type Route = Array<Coordinates>;

export class RouteService {
  private readonly BASE_URL = "https://valhalla1.openstreetmap.de/route";

  async fetchRoute(
    start: Coordinates | string,
    end: Coordinates | string
  ): Promise<Route> {
    const axiosConfig = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    try {
      // Format coordinates to string format required by OSRM API
      const startCoords = start;
      const endCoords = end.split(",").map((part) => parseFloat(part));

      const body = {
        locations: [
          { lat: startCoords[0], lon: startCoords[1] },
          { lat: endCoords[0], lon: endCoords[1] },
        ],
        costing: "auto",
        directions_options: { units: "km" },
      };

      const response = await axios.post(this.BASE_URL, body, axiosConfig);

      if (!response.data.trip) {
        throw new Error("No route found.");
      }

      return response.data.trip.legs[0].shape;
    } catch (error) {
      console.error("Route fetch error:", error);
      throw new Error(
        "Unable to load route information. Please try again later."
      );
    }
  }
}
