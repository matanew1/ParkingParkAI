import axios from "axios";

export class RouteService {
  private readonly BASE_URL = "http://router.project-osrm.org/route/v1";

  async fetchRoute(start: string, end: string): Promise<Route> {
    const axiosConfig = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    try {
      const url = `${this.BASE_URL}/driving/${start};${end}?overview=full&geometries=geojson&steps=true`;
      console.log("url:", url);
      const response = await axios.get(url, axiosConfig);
      console.log("response:", response.data.routes[0].geometry.coordinates);
      if (!response.data || !response.data.routes) {
        throw new Error("Invalid route data format");
      }

      return response.data.routes[0].geometry.coordinates;
    } catch {
      throw new Error(
        "Unable to load route information. Please try again later."
      );
    }
  }

  // Removed useEffect as it cannot be used inside a class. Use it in a functional component instead.
}
