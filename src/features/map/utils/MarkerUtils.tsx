import { divIcon } from "leaflet";
import "./MarkerUtils.css";
import { useMap } from "react-leaflet";
import React, { useEffect, useMemo } from "react";
import { useMediaQuery, useTheme, alpha } from "@mui/material";
import type { ParkingSpotWithStatus } from "../../../Types/parking";
import type { Coordinates } from "../../../Types/location";

// ─── Status colours ───────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  "פנוי": { light: "#10B981", dark: "#059669" },
  "מעט": { light: "#F59E0B", dark: "#D97706" },
  "מלא": { light: "#EF4444", dark: "#DC2626" },
  "סגור": { light: "#64748B", dark: "#475569" },
  "פעיל": { light: "#2563EB", dark: "#1D4ED8" },
};

const getStatusColor = (status?: string, isDark = false): string => {
  const colors = STATUS_COLORS[status ?? ""];
  if (!colors) {
    return isDark ? "#1D4ED8" : "#2563EB";
  }
  return isDark ? colors.dark : colors.light;
};

// ─── SVG marker builder ────────────────────────────────────────────────────────
const makePMarker = (color: string, selected = false, isDark = false) => {
  const size = selected ? 42 : 32;
  const half = size / 2;
  const outerR = selected ? 17 : 13;
  const innerR = selected ? 12 : 9.5;
  const fontSize = selected ? 14 : 11;
  const fontY = half + fontSize * 0.36;
  
  // Reduce shadow opacity and circle opacity in dark mode
  const shadowOpacity = isDark ? (selected ? 0.2 : 0.12) : (selected ? 0.35 : 0.24);
  const circleOpacity = isDark ? 0.08 : 0.14;
  const markerFill = isDark ? 0.92 : 0.96;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="markerShadow" x="-45%" y="-45%" width="190%" height="190%">
      <feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="${color}" flood-opacity="${shadowOpacity}"/>
    </filter>
  </defs>
  ${selected ? `<circle cx="${half}" cy="${half}" r="${half - 1}" fill="${color}" opacity="${circleOpacity}"/>` : ""}
  <circle cx="${half}" cy="${half}" r="${outerR}" fill="white" opacity="${markerFill}" filter="url(#markerShadow)"/>
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

export const getMarkerIcon = (status?: string, isDark = false) => {
  const color = getStatusColor(status, isDark);
  const key = `p-${color}-${isDark ? "dark" : "light"}`;
  if (!iconCache.has(key)) iconCache.set(key, makePMarker(color, false, isDark));
  return iconCache.get(key)!;
};

export const getSelectedMarkerIcon = (isDark = false) => {
  const color = getStatusColor("פעיל", isDark);
  const key = `p-selected-${isDark ? "dark" : "light"}`;
  if (!iconCache.has(key)) iconCache.set(key, makePMarker(color, true, isDark));
  return iconCache.get(key)!;
};

// ─── User location marker ──────────────────────────────────────────────────────
const makeUserLocationIcon = (isDark = false) => {
  const color = isDark ? "#1D4ED8" : "#2563EB";
  const outerOpacity = isDark ? 0.1 : 0.18;
  
  return divIcon({
    html: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <circle cx="14" cy="14" r="13" fill="${color}" opacity="${outerOpacity}"/>
  <circle cx="14" cy="14" r="9" fill="${color}" stroke="white" stroke-width="2.5"/>
  <circle cx="14" cy="14" r="4" fill="white"/>
</svg>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });
};

const userLocationIconCache = new Map<string, ReturnType<typeof divIcon>>();

export const getUserLocationIcon = (isDark = false) => {
  const key = `user-location-${isDark ? "dark" : "light"}`;
  if (!userLocationIconCache.has(key)) {
    userLocationIconCache.set(key, makeUserLocationIcon(isDark));
  }
  return userLocationIconCache.get(key)!;
};

export const userLocationIcon = makeUserLocationIcon(false);

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
