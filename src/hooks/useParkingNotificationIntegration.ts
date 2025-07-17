import { useEffect, useRef } from 'react';
import { useParkingContext } from '../Context/ParkingContext';
import { useNotifications } from '../Context/NotificationContext';
import { useFavorites } from '../Context/FavoritesContext';

/**
 * Hook to integrate parking data with notification system
 * Monitors parking status changes and sends notifications when spots become available
 */
export const useParkingNotificationIntegration = () => {
  const { parkingSpots, lastUpdated } = useParkingContext();
  const { updateParkingStatuses, isInitialized } = useNotifications();
  const { favorites } = useFavorites();
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the first run to avoid notifications on initial load
    if (isFirstRun.current || !isInitialized || !parkingSpots.length) {
      isFirstRun.current = false;
      return;
    }

    try {
      // Update parking statuses and get change events
      const changes = updateParkingStatuses(parkingSpots, favorites);
      
      if (changes.length > 0) {
        console.log(`Detected ${changes.length} parking status changes:`, changes);
        
        // Log specific changes for debugging
        changes.forEach(change => {
          console.log(
            `Spot "${change.spotName}" (${change.spotId}): ${change.previousStatus} → ${change.currentStatus}`,
            change.isFavorite ? '[FAVORITE]' : ''
          );
        });
      }
    } catch (error) {
      console.error('Error processing parking status changes:', error);
    }
  }, [parkingSpots, lastUpdated, updateParkingStatuses, favorites, isInitialized]);

  return {
    isMonitoring: isInitialized && !isFirstRun.current,
  };
};

export default useParkingNotificationIntegration;
