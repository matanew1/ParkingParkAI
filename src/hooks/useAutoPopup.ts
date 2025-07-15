import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Hook to manage automatic popup opening for selected markers
 */
export const useAutoPopup = (
  lat: number,
  lng: number,
  isSelected: boolean,
  showDetails: boolean,
  spotName: string
) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !isSelected) return;

    let attempts = 0;
    const maxAttempts = 10; // Increased attempts for better reliability
    
    const tryOpenPopup = () => {
      attempts++;
      
      try {
        console.log(`Attempt ${attempts} to open popup for: ${spotName}`);
        
        // Close any existing popups first
        map.closePopup();
        
        let foundMarker = false;
        
        // Search through all map layers to find our marker
        map.eachLayer((layer: any) => {
          if (foundMarker) return;
          
          // Check if this is a marker with the right coordinates
          if (layer.getLatLng && layer.getPopup) {
            const markerLatLng = layer.getLatLng();
            const latDiff = Math.abs(markerLatLng.lat - lat);
            const lngDiff = Math.abs(markerLatLng.lng - lng);
            
            // If coordinates match (within small tolerance)
            if (latDiff < 0.0001 && lngDiff < 0.0001) {
              foundMarker = true;
              console.log(`Found matching marker for ${spotName}, opening popup`);
              
              // Open popup immediately if showDetails is true, or with a small delay otherwise
              const delay = showDetails ? 0 : 100;
              setTimeout(() => {
                try {
                  layer.openPopup();
                } catch (e) {
                  console.warn('Failed to open popup:', e);
                }
              }, delay);
            }
          }
        });
        
        // If marker not found and we haven't exceeded max attempts, try again
        if (!foundMarker && attempts < maxAttempts) {
          setTimeout(tryOpenPopup, 150); // Slightly increased delay
        } else if (!foundMarker) {
          console.warn(`Could not find marker for ${spotName} after ${maxAttempts} attempts`);
        }
        
      } catch (error) {
        console.warn('Error in tryOpenPopup:', error);
      }
    };

    // Start trying to open popup after a delay
    const timer = setTimeout(tryOpenPopup, 200); // Slightly reduced initial delay
    
    return () => clearTimeout(timer);
  }, [isSelected, showDetails, map, lat, lng, spotName]);
};
