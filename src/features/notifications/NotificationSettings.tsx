import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  Divider,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useNotificationStore, NotificationSettingsType } from "../../stores/notificationStore";
import { notificationService } from "../../Services/notificationService";

// iOS Safari only supports Web Notifications when the site is installed as
// a home-screen PWA (iOS 16.4+). Detect that to surface accurate guidance
// instead of silently failing.
const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true);

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ open, onClose }) => {
  const {
    settings,
    notifications,
    unreadCount,
    permissionGranted,
    updateSettings,
    requestPermission,
    clearNotifications,
  } = useNotificationStore();

  const [localSettings, setLocalSettings] = useState<NotificationSettingsType>(settings);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<null | {
    ok: boolean;
    message: string;
  }>(null);

  // Keep local form state in sync if the store updates while the dialog is open
  // (e.g. after the user grants permission and we auto-enable settings).
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, open]);

  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const onIOS = isIOS();
  const iOSNeedsPWA = onIOS && !isStandalone();
  const supportsNotifications =
    typeof window !== "undefined" && "Notification" in window;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    setPermissionError(null);
    try {
      // requestPermission on the store also auto-enables settings.enabled.
      const granted = await requestPermission();
      if (granted) {
        setLocalSettings((prev) => ({ ...prev, enabled: true }));
      } else {
        setPermissionError(
          'Notification permission denied. Enable it in your browser settings to receive alerts.'
        );
      }
    } catch (error) {
      setPermissionError(
        error instanceof Error ? error.message : 'Failed to request notification permission'
      );
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleSendTest = async () => {
    setTestStatus(null);
    // Persist any pending changes so the test reflects the current toggles.
    updateSettings(localSettings);
    const result = await notificationService.sendTestNotification();
    if (result.ok) {
      setTestStatus({ ok: true, message: 'Test sent! Check your notifications.' });
    } else {
      setTestStatus({
        ok: false,
        message: result.reason || 'Could not send the test notification.',
      });
    }
  };

  const updateLocalSettings = (updates: Partial<NotificationSettingsType>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  };

  const updateQuietHours = (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [field]: value },
    }));
  };

  const recentCount = notifications.filter(n => {
    const age = Date.now() - new Date(n.timestamp).getTime();
    return age < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationsIcon />
          Notification Settings
          {unreadCount > 0 && (
            <Chip label={unreadCount} size="small" color="primary" sx={{ ml: "auto" }} />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Permission Status */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Permission Status
              </Typography>

              {!supportsNotifications && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  This browser does not support web notifications.
                </Alert>
              )}

              {supportsNotifications && iOSNeedsPWA && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>iPhone / iPad:</strong> Safari only delivers notifications
                  when the site is added to your Home Screen.
                  <Box sx={{ mt: 1, fontSize: "0.875rem" }}>
                    Tap the Share button → <em>Add to Home Screen</em>, then open
                    ParkAI from the home screen icon and enable notifications.
                  </Box>
                </Alert>
              )}

              {supportsNotifications && !permissionGranted ? (
                <Box>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Notifications are disabled. Enable them to receive parking alerts.
                    {isMobileDevice && !onIOS && (
                      <Box sx={{ mt: 1, fontSize: "0.875rem" }}>
                        <strong>Mobile users:</strong> Allow notifications when your browser prompts.
                      </Box>
                    )}
                  </Alert>
                  {permissionError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {permissionError}
                      {isMobileDevice && permissionError.includes("denied") && (
                        <Box sx={{ mt: 1, fontSize: "0.875rem" }}>
                          Go to browser settings → Site permissions → Notifications → Allow.
                        </Box>
                      )}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleRequestPermission}
                    disabled={isRequestingPermission || iOSNeedsPWA}
                    startIcon={<NotificationsIcon />}
                    fullWidth
                  >
                    {isRequestingPermission ? "Requesting..." : "Enable Notifications"}
                  </Button>
                </Box>
              ) : supportsNotifications ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Notifications are enabled.
                  </Alert>
                  {testStatus && (
                    <Alert
                      severity={testStatus.ok ? "success" : "error"}
                      sx={{ mb: 2 }}
                    >
                      {testStatus.message}
                    </Alert>
                  )}
                  <Button
                    variant="outlined"
                    onClick={handleSendTest}
                    startIcon={<SendIcon />}
                    fullWidth
                  >
                    Send test notification
                  </Button>
                </Box>
              ) : null}
            </CardContent>
          </Card>

          {/* Stats */}
          {recentCount > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity (24h)
                    </Typography>
                    <Chip label={`${recentCount} notification${recentCount !== 1 ? "s" : ""}`} size="small" />
                  </Box>
                  {notifications.length > 0 && (
                    <Button size="small" color="error" onClick={clearNotifications}>
                      Clear all
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Main Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.enabled}
                onChange={e => updateLocalSettings({ enabled: e.target.checked })}
                disabled={!permissionGranted}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {localSettings.enabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
                <Typography variant="body1">Enable Notifications</Typography>
              </Box>
            }
          />

          <Divider />

          {/* Notification Types */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Alert Types
            </Typography>
            <FormGroup sx={{ gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.statusChangeAlerts}
                    onChange={e =>
                      updateLocalSettings({ statusChangeAlerts: e.target.checked })
                    }
                    disabled={!localSettings.enabled || !permissionGranted}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2">Availability Alerts</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Notify when any parking spot becomes available
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.favoriteAlerts}
                    onChange={e =>
                      updateLocalSettings({ favoriteAlerts: e.target.checked })
                    }
                    disabled={!localSettings.enabled || !permissionGranted}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StarIcon fontSize="small" color="warning" />
                    <Box>
                      <Typography variant="body2">Favorite Spot Alerts</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Priority alerts when your favorite spots open up
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </FormGroup>
          </Box>

          <Divider />

          {/* Quiet Hours */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ScheduleIcon />
              Quiet Hours
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.quietHours.enabled}
                  onChange={e =>
                    updateLocalSettings({
                      quietHours: { ...localSettings.quietHours, enabled: e.target.checked },
                    })
                  }
                  disabled={!localSettings.enabled || !permissionGranted}
                />
              }
              label="Enable quiet hours"
              sx={{ mb: 2 }}
            />

            {localSettings.quietHours.enabled && (
              <>
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={localSettings.quietHours.start}
                    onChange={e => updateQuietHours("start", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    size="small"
                    disabled={!localSettings.enabled || !permissionGranted}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={localSettings.quietHours.end}
                    onChange={e => updateQuietHours("end", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    size="small"
                    disabled={!localSettings.enabled || !permissionGranted}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  No notifications will be sent during quiet hours
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettings;
