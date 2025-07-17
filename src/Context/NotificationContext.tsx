import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  notificationService, 
  ParkingNotification, 
  NotificationPreferences,
  StatusChangeEvent
} from '../Services/notificationService';
import { ParkingSpotWithStatus } from '../Types/parking';
import { FavoriteSpot } from '../Services/favoritesService';

interface NotificationContextType {
  notifications: ParkingNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  permissionGranted: boolean;
  isInitialized: boolean;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  updatePreferences: (preferences: NotificationPreferences) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  updateParkingStatuses: (spots: ParkingSpotWithStatus[], favorites: FavoriteSpot[]) => StatusChangeEvent[];
  notifyFavoriteSpotAvailable: (spot: ParkingSpotWithStatus, nickname?: string) => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ParkingNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationService.getPreferences());
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notification system
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check current permission status
        if ('Notification' in window) {
          setPermissionGranted(Notification.permission === 'granted');
        }

        // Load existing notifications
        refreshNotifications();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize notification system:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Refresh notifications from storage
  const refreshNotifications = useCallback(() => {
    try {
      const storedNotifications = notificationService.getStoredNotifications();
      setNotifications(storedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback((newPreferences: NotificationPreferences) => {
    try {
      notificationService.updatePreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    try {
      notificationService.markAsRead(notificationId);
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [refreshNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    try {
      notificationService.markAllAsRead();
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [refreshNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    try {
      notificationService.clearAllNotifications();
      refreshNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, [refreshNotifications]);

  // Update parking statuses and detect changes
  const updateParkingStatuses = useCallback((spots: ParkingSpotWithStatus[], favorites: FavoriteSpot[]): StatusChangeEvent[] => {
    try {
      const changes = notificationService.updateParkingStatuses(spots, favorites);
      
      // Refresh notifications if there were changes
      if (changes.length > 0) {
        refreshNotifications();
      }
      
      return changes;
    } catch (error) {
      console.error('Failed to update parking statuses:', error);
      return [];
    }
  }, [refreshNotifications]);

  // Notify about favorite spot availability
  const notifyFavoriteSpotAvailable = useCallback(async (spot: ParkingSpotWithStatus, nickname?: string): Promise<void> => {
    try {
      await notificationService.notifyFavoriteSpotAvailable(spot, nickname);
      refreshNotifications();
    } catch (error) {
      console.error('Failed to notify about favorite spot:', error);
    }
  }, [refreshNotifications]);

  // Automatically refresh notifications periodically
  useEffect(() => {
    const intervalId = setInterval(refreshNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [refreshNotifications]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    permissionGranted,
    isInitialized,
    requestPermission,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    updateParkingStatuses,
    notifyFavoriteSpotAvailable,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
