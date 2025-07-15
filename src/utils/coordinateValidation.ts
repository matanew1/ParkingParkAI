/**
 * Coordinate validation utilities for Israel region
 * Helps filter out invalid parking coordinates that might appear in the sea or outside valid areas
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

// Geographic bounds for Israel region
export const ISRAEL_BOUNDS = {
  MIN_LAT: 31.0,   // Southern boundary
  MAX_LAT: 33.5,   // Northern boundary  
  MIN_LON: 34.3,   // Western boundary (excludes sea)
  MAX_LON: 35.9,   // Eastern boundary
};

/**
 * Validates if coordinates are within reasonable bounds for Israel
 * and not in the Mediterranean Sea
 */
export function isValidIsraeliCoordinate(lat: number, lon: number): boolean {
  // Basic validation - check for valid numbers
  if (isNaN(lat) || isNaN(lon)) return false;
  if (lat === 0 && lon === 0) return false;
  if (lat === null || lon === null || lat === undefined || lon === undefined) return false;
  
  // Check if coordinates are within Israel's bounds
  if (lat < ISRAEL_BOUNDS.MIN_LAT || lat > ISRAEL_BOUNDS.MAX_LAT) {
    return false;
  }
  
  if (lon < ISRAEL_BOUNDS.MIN_LON || lon > ISRAEL_BOUNDS.MAX_LON) {
    return false;
  }
  
  // Additional validation: exclude coordinates in Mediterranean Sea
  // For Tel Aviv area, anything west of longitude 34.75 is likely in the sea
  if (lon < 34.75 && lat > 31.5 && lat < 32.5) {
    return false;
  }
  
  return true;
}

/**
 * Validates coordinates with detailed logging for debugging
 */
export function validateCoordinateWithLogging(
  lat: number, 
  lon: number, 
  context: string = ''
): boolean {
  if (!isValidIsraeliCoordinate(lat, lon)) {
    if (isNaN(lat) || isNaN(lon)) {
      console.warn(`${context}: Invalid coordinates (NaN): lat=${lat}, lon=${lon}`);
    } else if (lat === 0 && lon === 0) {
      console.warn(`${context}: Invalid coordinates (0,0): lat=${lat}, lon=${lon}`);
    } else if (lat < ISRAEL_BOUNDS.MIN_LAT || lat > ISRAEL_BOUNDS.MAX_LAT) {
      console.warn(`${context}: Latitude outside Israel bounds: lat=${lat} (expected ${ISRAEL_BOUNDS.MIN_LAT}-${ISRAEL_BOUNDS.MAX_LAT})`);
    } else if (lon < ISRAEL_BOUNDS.MIN_LON || lon > ISRAEL_BOUNDS.MAX_LON) {
      console.warn(`${context}: Longitude outside Israel bounds: lon=${lon} (expected ${ISRAEL_BOUNDS.MIN_LON}-${ISRAEL_BOUNDS.MAX_LON})`);
    } else if (lon < 34.75 && lat > 31.5 && lat < 32.5) {
      console.warn(`${context}: Coordinates in Mediterranean Sea: lat=${lat}, lon=${lon}`);
    }
    return false;
  }
  return true;
}

/**
 * Filters an array of objects with coordinates, removing invalid ones
 */
export function filterValidCoordinates<T extends Coordinates>(
  items: T[],
  context: string = ''
): T[] {
  const initialCount = items.length;
  const filtered = items.filter(item => 
    validateCoordinateWithLogging(item.lat, item.lon, context)
  );
  
  if (filtered.length !== initialCount) {
    console.log(`${context}: Filtered out ${initialCount - filtered.length} items with invalid coordinates`);
  }
  
  return filtered;
}
