import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useNotificationStore, NotificationSettingsType } from "../../stores/notificationStore";
import { notificationService } from "../../Services/notificationService";

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

  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    setPermissionError(null);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        await requestPermission();
      } else {
        setPermissionError(
          'Notification permission denied. Please enable it in your browser settings.'
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
              {!permissionGranted ? (
                <Box>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Notifications are disabled. Enable them to receive parking alerts.
                    {isMobileDevice && (
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
                    disabled={isRequestingPermission}
                    startIcon={<NotificationsIcon />}
                    fullWidth
                  >
                    {isRequestingPermission ? "Requesting..." : "Enable Notifications"}
                  </Button>
                </Box>
              ) : (
                <Alert severity="success">Notifications are enabled and working!</Alert>
              )}
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
