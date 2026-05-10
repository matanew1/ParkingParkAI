import { ParkingSpotWithStatus } from '../Types/parking';
import { useNotificationStore } from '../stores/notificationStore';

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    availabilityAlerts: boolean;
    favoriteSpotUpdates: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  vibration: boolean;
}

export interface StatusChangeEvent {
  spotId: string;
  spotName: string;
  previousStatus: string;
  currentStatus: string;
  timestamp: Date;
  isFavorite: boolean;
  nickname?: string;
}

export interface FavoriteRef {
  id: string;
  nickname?: string;
}

export class NotificationService {
  private readonly PREFERENCES_KEY = 'notification_preferences';
  private readonly STATUS_HISTORY_KEY = 'parking_status_history';
  private readonly MAX_HISTORY = 200;
  private statusHistory: Map<string, string> = new Map();

  constructor() {
    try {
      this.loadStatusHistory();
      this.initializeServiceWorker().catch(() => {});
    } catch {}
  }

  private async initializeServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {}
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  getPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(this.PREFERENCES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      types: { availabilityAlerts: true, favoriteSpotUpdates: true },
      quietHours: { enabled: false, start: '22:00', end: '07:00' },
      vibration: true,
    };
  }

  updatePreferences(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {}
  }

  private isQuietTime(): boolean {
    const pref = this.getPreferences();
    if (!pref.quietHours.enabled) return false;
    const now = new Date();
    const current = now.getHours() * 100 + now.getMinutes();
    const start = this.timeToNum(pref.quietHours.start);
    const end = this.timeToNum(pref.quietHours.end);
    return start <= end
      ? current >= start && current <= end
      : current >= start || current <= end;
  }

  private timeToNum(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 100 + m;
  }

  private loadStatusHistory(): void {
    try {
      const saved = localStorage.getItem(this.STATUS_HISTORY_KEY);
      if (saved) this.statusHistory = new Map(JSON.parse(saved));
    } catch {
      this.statusHistory = new Map();
    }
  }

  private saveStatusHistory(): void {
    try {
      const arr = Array.from(this.statusHistory.entries());
      if (arr.length > this.MAX_HISTORY) {
        arr.splice(0, arr.length - this.MAX_HISTORY);
        this.statusHistory = new Map(arr);
      }
      localStorage.setItem(this.STATUS_HISTORY_KEY, JSON.stringify(arr));
    } catch {}
  }

  updateParkingStatuses(
    spots: ParkingSpotWithStatus[],
    favorites: FavoriteRef[]
  ): StatusChangeEvent[] {
    const notifStore = useNotificationStore.getState();
    const { settings } = notifStore;

    const changes: StatusChangeEvent[] = [];
    const favoriteMap = new Map(favorites.map(f => [f.id, f.nickname]));

    for (const spot of spots) {
      const spotId = spot.code_achoza.toString();
      const currentStatus = spot.status_chenyon || 'Unknown';
      const previousStatus = this.statusHistory.get(spotId);

      if (previousStatus && previousStatus !== currentStatus) {
        const isFavorite = favoriteMap.has(spotId);
        const isImprovement = this.isStatusImprovement(previousStatus, currentStatus);

        if (isImprovement || isFavorite) {
          const event: StatusChangeEvent = {
            spotId,
            spotName: spot.shem_chenyon || 'Unknown Parking',
            previousStatus,
            currentStatus,
            timestamp: new Date(),
            isFavorite,
            nickname: favoriteMap.get(spotId),
          };
          changes.push(event);

          if (
            settings.enabled &&
            !this.isQuietTime() &&
            Notification.permission === 'granted' &&
            isImprovement
          ) {
            const shouldNotify = isFavorite
              ? settings.favoriteAlerts
              : settings.statusChangeAlerts;

            if (shouldNotify) {
              const displayName = event.nickname || event.spotName;
              const title = isFavorite
                ? '⭐ Favorite Spot Available!'
                : '🅿️ Parking Available!';
              const message = `${displayName} is now available`;
              const priority = isFavorite ? 'high' : 'medium';

              notifStore.addNotification({
                title,
                message,
                type: 'success',
                spotId,
                priority,
              });

              this.showBrowserNotification(title, message, spotId, priority);
            }
          }
        }
      }

      this.statusHistory.set(spotId, currentStatus);
    }

    if (changes.length > 0) this.saveStatusHistory();
    return changes;
  }

  private isStatusImprovement(prev: string, curr: string): boolean {
    const open = ['פנוי', 'פעיל', 'available', 'open'];
    const closed = ['מלא', 'סגור', 'מעט', 'full', 'closed', 'limited'];
    const wasClosed = closed.some(s => prev.toLowerCase().includes(s.toLowerCase()));
    const isNowOpen = open.some(s => curr.toLowerCase().includes(s.toLowerCase()));
    return wasClosed && isNowOpen;
  }

  showBrowserNotification(
    title: string,
    body: string,
    tag: string,
    priority: 'low' | 'medium' | 'high'
  ): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const pref = this.getPreferences();
      if (pref.vibration && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      const n = new Notification(title, {
        body,
        icon: '/me.png',
        badge: '/me.png',
        tag,
        requireInteraction: priority === 'high',
      });
      n.onclick = () => { window.focus(); n.close(); };
      if (priority !== 'high') setTimeout(() => n.close(), 10000);
    } catch {}
  }

  clearStatusHistory(): void {
    this.statusHistory.clear();
    try {
      localStorage.removeItem(this.STATUS_HISTORY_KEY);
    } catch {}
  }
}

export const notificationService = (() => {
  try {
    return new NotificationService();
  } catch {
    return {
      requestPermission: () => Promise.resolve(false),
      getPreferences: () => ({
        enabled: false,
        types: { availabilityAlerts: false, favoriteSpotUpdates: false },
        quietHours: { enabled: false, start: '22:00', end: '07:00' },
        vibration: false,
      }),
      updatePreferences: () => {},
      updateParkingStatuses: () => [],
      showBrowserNotification: () => {},
      clearStatusHistory: () => {},
    } as unknown as NotificationService;
  }
})();
