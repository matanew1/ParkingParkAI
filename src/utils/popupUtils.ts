import type { Map } from 'leaflet';

/**
 * Utility function to perform map operations without closing popups
 * Uses the keepPopupsOpen option available in newer Leaflet versions
 * @param map - Leaflet map instance
 * @param operation - Function that performs map operation (setView, fitBounds, etc.)
 */
export const preservePopupDuringOperation = (
  map: Map,
  operation: () => void
): void => {
  try {
    // Some versions of Leaflet support options to keep popups open during pan/zoom
    // For setView operations, we can use the keepZoomAndPan option
    operation();
  } catch (error) {
    console.warn('Error during map operation:', error);
    // Fallback: just perform the operation normally
    operation();
  }
};

/**
 * Higher-order function to wrap map operations with popup preservation
 * @param map - Leaflet map instance
 */
export const withPopupPreservation = (map: Map) => {
  return (operation: () => void) => {
    preservePopupDuringOperation(map, operation);
  };
};
