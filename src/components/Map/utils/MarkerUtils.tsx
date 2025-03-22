import { Icon } from "leaflet";
import "./MarkerUtils.css";

// User location marker (green)
export const userLocationIcon = new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png`,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Returns a marker icon based on the parking spot status
 * @param status The status of the parking spot
 * @returns Leaflet Icon with appropriate color
 */
export const getMarkerIcon = (status?: string) => {
  const color = status === "מלא" ? "red" : "blue";
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export const selectedMarkerIcon = L.divIcon({
  className: "selected-marker-icon",
  html: `
    <div style="
      position: relative;
      width: 35px;
      height: 55px;
    ">
      <img 
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" 
        style="width: 100%; height: 100%;"
      />
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.8);
        animation: glow 1.5s infinite;
      "></div>
    </div>
  `,
  iconSize: [30, 50], // Larger size for emphasis
  iconAnchor: [17, 55],
  popupAnchor: [1, -34],
});
