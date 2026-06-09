import { divIcon } from "leaflet";
import "./MarkerUtils.css";
import { useMap } from "react-leaflet";
import React, { useEffect, useMemo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import type { ParkingSpotWithStatus } from "../../../Types/parking";
import type { Coordinates } from "../../../Types/location";

// ─── Status colours ───────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  "פנוי": "#10B981",
  "מעט": "#F59E0B",
  "מלא": "#EF4444",
  "סגור": "#64748B",
  "פעיל": "#2563EB",
};
const DEFAULT_COLOR = "#2563EB";

const getStatusColor = (status?: string) =>
  STATUS_COLORS[status ?? ""] ?? DEFAULT_COLOR;

// ─── SVG marker builder ────────────────────────────────────────────────────────
const makePMarker = (color: string, selected = false) => {
  const size = selected ? 42 : 32;
  const half = size / 2;
  const outerR = selected ? 17 : 13;
  const innerR = selected ? 12 : 9.5;
  const fontSize = selected ? 14 : 11;
  const fontY = half + fontSize * 0.36;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="markerShadow" x="-45%" y="-45%" width="190%" height="190%">
      <feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="${color}" flood-opacity="${selected ? 0.35 : 0.24}"/>
    </filter>
  </defs>
  ${selected ? `<circle cx="${half}" cy="${half}" r="${half - 1}" fill="${color}" opacity="0.14"/>` : ""}
  <circle cx="${half}" cy="${half}" r="${outerR}" fill="white" opacity="0.96" filter="url(#markerShadow)"/>
  <circle cx="${half}" cy="${half}" r="${innerR}" fill="${color}"/>
  <text x="${half}" y="${fontY}" font-family="-apple-system,BlinkMacSystemFont,'Inter',sans-serif" font-size="${fontSize}" font-weight="850" fill="white" text-anchor="middle">P</text>
</svg>`;

  return divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 6)],
  });
};

// ─── Icon cache ────────────────────────────────────────────────────────────────
const iconCache = new Map<string, ReturnType<typeof divIcon>>();

export const getMarkerIcon = (status?: string) => {
  const color = getStatusColor(status);
  const key = `p-${color}`;
  if (!iconCache.has(key)) iconCache.set(key, makePMarker(color));
  return iconCache.get(key)!;
};

export const selectedMarkerIcon = makePMarker("#2563EB", true);

// ─── User location marker ──────────────────────────────────────────────────────
export const userLocationIcon = divIcon({
  html: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <circle cx="14" cy="14" r="13" fill="#2563EB" opacity="0.18"/>
  <circle cx="14" cy="14" r="9" fill="#2563EB" stroke="white" stroke-width="2.5"/>
  <circle cx="14" cy="14" r="4" fill="white"/>
</svg>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

// ─── MapZoomController — flies the map to the selected spot ──────────────────────
export const MapZoomController: React.FC<{
  selectedSpotId: string | null;
  spots: ParkingSpotWithStatus[];
}> = ({ selectedSpotId, spots }) => {
  const map = useMap();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selectedSpot = useMemo(
    () =>
      selectedSpotId
        ? spots.find((s) => s.code_achoza.toString() === selectedSpotId)
        : null,
    [selectedSpotId, spots]
  );

  useEffect(() => {
    if (!selectedSpot) return;
    const pos: Coordinates = [selectedSpot.lat, selectedSpot.lon];
    if (!isNaN(pos[0]) && !isNaN(pos[1])) {
      map.flyTo(pos, isMobile ? 17 : 18, {
        animate: true,
        duration: isMobile ? 1.2 : 1.5,
      });
    }
  }, [selectedSpot, map, isMobile]);

  return null;
};
