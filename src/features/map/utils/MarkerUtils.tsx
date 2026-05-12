import { divIcon } from "leaflet";
import L from "leaflet";
import "./MarkerUtils.css";
import { useMap } from "react-leaflet";
import React, { useEffect, useCallback, useMemo } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import type { ParkingSpotWithStatus } from "../../Types/parking";
import type { Coordinates } from "../../Services/routeService";

// ─── Status colours (Waze-inspired vibrant palette) ───────────────────────────
const STATUS_COLORS: Record<string, string> = {
  "פנוי": "#2ed573",   // available – bright lime green
  "מעט": "#ffd32a",    // limited   – bright amber
  "מלא": "#ff4757",    // full      – vivid red
  "סגור": "#57606f",   // closed    – dark gray
  "פעיל": "#00c8ff",   // active    – cyan
};
const DEFAULT_COLOR = "#00c8ff";

const getStatusColor = (status?: string) =>
  STATUS_COLORS[status ?? ""] ?? DEFAULT_COLOR;

// ─── SVG marker builder ────────────────────────────────────────────────────────
const makePMarker = (color: string, selected = false) => {
  const size = selected ? 36 : 28;
  const half = size / 2;
  const r = selected ? 13 : 10;
  const fontSize = selected ? 13 : 10;
  const fontY = half + fontSize * 0.38;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${selected ? `<circle cx="${half}" cy="${half}" r="${half - 1}" fill="${color}" opacity="0.22"/>` : ""}
  <circle cx="${half}" cy="${half}" r="${r}" fill="${color}" stroke="white" stroke-width="${selected ? 2.5 : 2}"/>
  <text x="${half}" y="${fontY}" font-family="-apple-system,BlinkMacSystemFont,'Inter',sans-serif" font-size="${fontSize}" font-weight="800" fill="white" text-anchor="middle">P</text>
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

export const selectedMarkerIcon = makePMarker("#00c8ff", true); // Waze cyan selected

// ─── User location marker ──────────────────────────────────────────────────────
export const userLocationIcon = divIcon({
  html: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <circle cx="14" cy="14" r="13" fill="#00c8ff" opacity="0.2"/>
  <circle cx="14" cy="14" r="9" fill="#00c8ff" stroke="white" stroke-width="2.5"/>
  <circle cx="14" cy="14" r="4" fill="white"/>
</svg>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

// ─── Route start / end markers ─────────────────────────────────────────────────
const makeLetterMarker = (letter: string, color: string) =>
  divIcon({
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15" fill="${color}" opacity="0.25"/>
  <circle cx="16" cy="16" r="11" fill="${color}" stroke="white" stroke-width="2.5"/>
  <text x="16" y="20.5" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="12" font-weight="800" fill="white" text-anchor="middle">${letter}</text>
</svg>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -22],
  });

export const routeIcons = {
  start: makeLetterMarker("A", "#2ed573"),
  end: makeLetterMarker("B", "#ff4757"),
};

// ─── MapZoomController ─────────────────────────────────────────────────────────
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

// ─── RouteZoomController ───────────────────────────────────────────────────────
const isValidCoord = (c: Coordinates) =>
  !isNaN(c[0]) && !isNaN(c[1]) && c[0] >= -90 && c[0] <= 90;

export const RouteZoomController: React.FC<{ routes: Coordinates[][] }> = ({ routes }) => {
  const map = useMap();

  const validRoutes = useCallback(
    (input: Coordinates[][]) => input.map((r) => r.filter(isValidCoord)).filter((r) => r.length),
    []
  );

  useEffect(() => {
    if (!routes.length || !routes[0]?.length) return;
    const vr = validRoutes(routes);
    if (!vr.length) return;
    try {
      const bounds = vr[0].reduce(
        (acc, c) => acc.extend([c[0], c[1]]),
        new L.LatLngBounds([vr[0][0][0], vr[0][0][1]], [vr[0][0][0], vr[0][0][1]])
      );
      map.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 1.0 });
    } catch {}
  }, [routes, map, validRoutes]);

  return null;
};
