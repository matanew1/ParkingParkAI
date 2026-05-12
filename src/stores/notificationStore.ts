import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationSettingsType {
  enabled: boolean;
  favoriteAlerts: boolean;
  statusChangeAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  spotId?: string;
  read: boolean;
  priority?: "low" | "medium" | "high";
}

export interface NotificationState {
  settings: NotificationSettingsType;
  notifications: NotificationItem[];
  unreadCount: number;
  isMonitoring: boolean;
  permissionGranted: boolean;

  // Settings actions
  updateSettings: (settings: Partial<NotificationSettingsType>) => void;
  toggleNotifications: () => void;
  toggleFavoriteAlerts: () => void;
  toggleStatusChangeAlerts: () => void;
  updateQuietHours: (
    quietHours: NotificationSettingsType["quietHours"]
  ) => void;

  // Notification actions
  addNotification: (
    notification: Omit<NotificationItem, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;

  // Permission
  requestPermission: () => Promise<boolean>;

  // Monitoring
  setMonitoring: (monitoring: boolean) => void;
}

const defaultSettings: NotificationSettingsType = {
  enabled: false,
  favoriteAlerts: true,
  statusChangeAlerts: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      notifications: [],
      unreadCount: 0,
      isMonitoring: false,
      permissionGranted: false,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      toggleNotifications: () => {
        set((state) => ({
          settings: { ...state.settings, enabled: !state.settings.enabled },
        }));
      },

      toggleFavoriteAlerts: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            favoriteAlerts: !state.settings.favoriteAlerts,
          },
        }));
      },

      toggleStatusChangeAlerts: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            statusChangeAlerts: !state.settings.statusChangeAlerts,
          },
        }));
      },

      updateQuietHours: (quietHours) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quietHours,
          },
        }));
      },

      addNotification: (notification) => {
        const newNotification: NotificationItem = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const newUnreadCount =
            notification && !notification.read
              ? state.unreadCount - 1
              : state.unreadCount;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: Math.max(0, newUnreadCount),
          };
        });
      },

      setMonitoring: (monitoring) => {
        set({ isMonitoring: monitoring });
      },

      requestPermission: async () => {
        if (!("Notification" in window)) {
          console.warn("This browser does not support notifications");
          return false;
        }

        try {
          const permission = await Notification.requestPermission();
          const granted = permission === "granted";
          set((state) => ({
            permissionGranted: granted,
            // Auto-enable when the user grants permission so they don't have
            // to hunt for a second toggle to start receiving alerts.
            settings: granted
              ? { ...state.settings, enabled: true }
              : state.settings,
          }));
          return granted;
        } catch (error) {
          console.error("Error requesting notification permission:", error);
          return false;
        }
      },
    }),
    {
      name: "notifications-storage",
      onRehydrateStorage: () => (state) => {
        // Resync permission state with the browser on every app load.
        // Otherwise a previously-granted permission stays as `false` in the
        // persisted store and the rest of the app thinks notifications are off.
        if (!state) return;
        if (typeof window !== "undefined" && "Notification" in window) {
          state.permissionGranted = Notification.permission === "granted";
        }
      },
    }
  )
);

// Also resync on tab focus — the user may have toggled the OS-level permission
// from another tab or from browser settings.
if (typeof window !== "undefined" && "Notification" in window) {
  const sync = () => {
    const granted = Notification.permission === "granted";
    const current = useNotificationStore.getState().permissionGranted;
    if (granted !== current) {
      useNotificationStore.setState({ permissionGranted: granted });
    }
  };
  window.addEventListener("focus", sync);
  // Initial sync (in case rehydrate ran before this module finished evaluating).
  sync();
}
