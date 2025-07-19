import { ParkingSpotWithStatus } from '../Types/parking';
import { FavoriteSpot } from './favoritesService';

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    availabilityAlerts: boolean;
    priceDropAlerts: boolean;
    statusChanges: boolean;
    favoriteSpotUpdates: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
  sound: boolean;
  vibration: boolean;
}

export interface ParkingNotification {
  id: string;
  type: 'status_change' | 'availability_alert' | 'price_drop' | 'favorite_update';
  title: string;
  body: string;
  spotId: string;
  spotName: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface StatusChangeEvent {
  spotId: string;
  spotName: string;
  previousStatus: string;
  currentStatus: string;
  timestamp: Date;
  isFavorite: boolean;
}

export class NotificationService {
  private readonly STORAGE_KEY = 'parking_notifications';
  private readonly PREFERENCES_KEY = 'notification_preferences';
  private readonly STATUS_HISTORY_KEY = 'parking_status_history';
  private readonly MAX_NOTIFICATIONS = 50;
  private readonly MAX_HISTORY = 200;

  private notificationQueue: ParkingNotification[] = [];
  private statusHistory: Map<string, string> = new Map();
  private registrationToken: string | null = null;

  constructor() {
    try {
      this.loadStatusHistory();
      this.initializeServiceWorker().catch(error => {
        console.warn('Service Worker initialization failed:', error);
      });
    } catch (error) {
      console.warn('NotificationService initialization failed:', error);
    }
  }

  /**
   * Initialize service worker for background notifications
   */
  private async initializeServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered for notifications');
    } catch (error) {
      console.warn('Service Worker registration failed (this is normal on some browsers):', error);
    }
  }

  /**
   * Detect if running on mobile device
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect if running on iOS Safari
   */
  private isIOSSafari(): boolean {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/CriOS|FxiOS/.test(userAgent);
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        throw new Error('Notifications are not supported in this browser');
      }

      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission === 'denied') {
        throw new Error('Notifications have been blocked. Please enable them in your browser settings.');
      }

      // Special handling for iOS Safari
      if (this.isIOSSafari()) {
        // iOS Safari requires the permission request to be in direct response to user action
        console.log('Requesting notification permission on iOS Safari...');
        
        // Use a more explicit approach for iOS
        const permission = await new Promise<NotificationPermission>((resolve) => {
          // For iOS Safari, we need to ensure this is called synchronously in the user gesture
          const result = Notification.requestPermission((perm) => {
            resolve(perm);
          });
          
          // Handle modern promise-based API if available
          if (result && typeof result.then === 'function') {
            result.then(resolve);
          }
        });

        if (permission === 'granted') {
          console.log('iOS Safari notification permission granted');
          return true;
        } else {
          throw new Error(`iOS Safari notification permission ${permission}. Please try again and allow notifications when prompted.`);
        }
      }

      // Standard approach for other browsers
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        throw new Error(`Notification permission ${permission}. Please enable notifications in your browser settings.`);
      }
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      
      // Provide more specific error messages for mobile users
      if (this.isMobileDevice()) {
        if (error instanceof Error) {
          throw error; // Re-throw our custom error messages
        }
        throw new Error('Notifications may not be supported on your mobile browser. Try using Chrome or Safari.');
      }
      
      throw error;
    }
  }

  /**
   * Get current notification preferences
   */
  getPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(this.PREFERENCES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }

    // Default preferences
    return {
      enabled: true,
      types: {
        availabilityAlerts: true,
        priceDropAlerts: true,
        statusChanges: true,
        favoriteSpotUpdates: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
      sound: true,
      vibration: true,
    };
  }

  /**
   * Update notification preferences
   */
  updatePreferences(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  /**
   * Check if notifications should be sent based on quiet hours
   */
  private isQuietTime(): boolean {
    const preferences = this.getPreferences();
    if (!preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const startTime = this.timeStringToNumber(preferences.quietHours.start);
    const endTime = this.timeStringToNumber(preferences.quietHours.end);

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Convert time string (HH:mm) to number for comparison
   */
  private timeStringToNumber(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Load parking status history from localStorage
   */
  private loadStatusHistory(): void {
    try {
      const saved = localStorage.getItem(this.STATUS_HISTORY_KEY);
      if (saved) {
        const historyArray: [string, string][] = JSON.parse(saved);
        this.statusHistory = new Map(historyArray);
      }
    } catch (error) {
      console.warn('Failed to load status history (localStorage may not be available):', error);
      this.statusHistory = new Map();
    }
  }

  /**
   * Save parking status history to localStorage
   */
  private saveStatusHistory(): void {
    try {
      const historyArray = Array.from(this.statusHistory.entries());
      // Keep only the most recent entries
      if (historyArray.length > this.MAX_HISTORY) {
        historyArray.splice(0, historyArray.length - this.MAX_HISTORY);
        this.statusHistory = new Map(historyArray);
      }
      localStorage.setItem(this.STATUS_HISTORY_KEY, JSON.stringify(historyArray));
    } catch (error) {
      console.error('Failed to save status history:', error);
    }
  }

  /**
   * Update parking spot statuses and detect changes
   */
  updateParkingStatuses(spots: ParkingSpotWithStatus[], favoriteSpots: FavoriteSpot[]): StatusChangeEvent[] {
    const changes: StatusChangeEvent[] = [];
    const favoriteSpotIds = new Set(favoriteSpots.map(fav => fav.id));

    for (const spot of spots) {
      const spotId = spot.code_achoza.toString();
      const currentStatus = spot.status_chenyon || 'Unknown';
      const previousStatus = this.statusHistory.get(spotId);

      if (previousStatus && previousStatus !== currentStatus) {
        const isStatusImproved = this.isStatusImprovement(previousStatus, currentStatus);
        const isFavorite = favoriteSpotIds.has(spotId);

        // Only create change event if status improved (non-open to open) or it's a favorite
        if (isStatusImproved || isFavorite) {
          const changeEvent: StatusChangeEvent = {
            spotId,
            spotName: spot.shem_chenyon || 'Unknown Parking',
            previousStatus,
            currentStatus,
            timestamp: new Date(),
            isFavorite,
          };

          changes.push(changeEvent);

          // Create notification for significant changes
          if (isStatusImproved && this.shouldNotify('statusChanges')) {
            this.createNotification(changeEvent, favoriteSpots);
          }
        }
      }

      // Update status history
      this.statusHistory.set(spotId, currentStatus);
    }

    if (changes.length > 0) {
      this.saveStatusHistory();
    }

    return changes;
  }

  /**
   * Determine if status change represents an improvement (non-open to open)
   */
  private isStatusImprovement(previousStatus: string, currentStatus: string): boolean {
    const openStatuses = ['פנוי', 'פעיל', 'available', 'open'];
    const nonOpenStatuses = ['מלא', 'סגור', 'מעט', 'full', 'closed', 'limited'];

    const wasNonOpen = nonOpenStatuses.some(status => 
      previousStatus.toLowerCase().includes(status.toLowerCase())
    );
    const isNowOpen = openStatuses.some(status => 
      currentStatus.toLowerCase().includes(status.toLowerCase())
    );

    return wasNonOpen && isNowOpen;
  }

  /**
   * Check if notification type should be sent
   */
  private shouldNotify(type: keyof NotificationPreferences['types']): boolean {
    const preferences = this.getPreferences();
    return preferences.enabled && 
           preferences.types[type] && 
           !this.isQuietTime() &&
           Notification.permission === 'granted';
  }

  /**
   * Create notification for status change
   */
  private createNotification(changeEvent: StatusChangeEvent, favoriteSpots: FavoriteSpot[]): void {
    const favorite = favoriteSpots.find(fav => fav.id === changeEvent.spotId);
    const displayName = favorite?.nickname || changeEvent.spotName;

    const notification: ParkingNotification = {
      id: `${changeEvent.spotId}_${Date.now()}`,
      type: 'status_change',
      title: '🅿️ Parking Available!',
      body: `${displayName} is now ${changeEvent.currentStatus}`,
      spotId: changeEvent.spotId,
      spotName: changeEvent.spotName,
      timestamp: changeEvent.timestamp,
      isRead: false,
      priority: changeEvent.isFavorite ? 'high' : 'medium',
      actionUrl: `#spot-${changeEvent.spotId}`,
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification);
  }

  /**
   * Add notification to storage
   */
  private addNotification(notification: ParkingNotification): void {
    try {
      const notifications = this.getStoredNotifications();
      notifications.unshift(notification);

      // Keep only the most recent notifications
      if (notifications.length > this.MAX_NOTIFICATIONS) {
        notifications.splice(this.MAX_NOTIFICATIONS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  /**
   * Get stored notifications
   */
  getStoredNotifications(): ParkingNotification[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const notifications = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return notifications.map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
    return [];
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: ParkingNotification): void {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      const options: NotificationOptions = {
        body: notification.body,
        icon: '/me.png',
        badge: '/me.png',
        tag: notification.spotId,
        timestamp: notification.timestamp.getTime(),
        requireInteraction: notification.priority === 'high',
        actions: [
          {
            action: 'view',
            title: 'View Parking Spot',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ],
      };

      const preferences = this.getPreferences();
      if (preferences.vibration && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (error) {
          console.warn('Vibration not supported:', error);
        }
      }

      const browserNotification = new Notification(notification.title, options);

      browserNotification.onclick = () => {
        window.focus();
        // Navigate to the parking spot
        if (notification.actionUrl) {
          window.location.hash = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 10 seconds for non-high priority notifications
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      }
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    try {
      const notifications = this.getStoredNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    try {
      const notifications = this.getStoredNotifications();
      notifications.forEach(notif => notif.isRead = true);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    const notifications = this.getStoredNotifications();
    return notifications.filter(notif => !notif.isRead).length;
  }

  /**
   * Create manual notification for favorite spot availability
   */
  async notifyFavoriteSpotAvailable(spot: ParkingSpotWithStatus, nickname?: string): Promise<void> {
    if (!this.shouldNotify('favoriteSpotUpdates')) {
      return;
    }

    const displayName = nickname || spot.shem_chenyon || 'Your favorite parking spot';
    
    const notification: ParkingNotification = {
      id: `favorite_${spot.code_achoza}_${Date.now()}`,
      type: 'favorite_update',
      title: '⭐ Favorite Spot Available!',
      body: `${displayName} is now available`,
      spotId: spot.code_achoza.toString(),
      spotName: spot.shem_chenyon || 'Unknown',
      timestamp: new Date(),
      isRead: false,
      priority: 'high',
      actionUrl: `#spot-${spot.code_achoza}`,
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification);
  }

  /**
   * Subscribe to push notifications (for future web push implementation)
   */
  async subscribeToPush(): Promise<string | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || ''),
      });

      this.registrationToken = JSON.stringify(subscription);
      return this.registrationToken;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Convert VAPID key for push subscription
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
