import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  VolumeUp as VolumeUpIcon,
  Vibration as VibrationIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../Context/NotificationContext';
import { NotificationPreferences } from '../../Services/notificationService';

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ open, onClose }) => {
  const { 
    preferences, 
    permissionGranted, 
    updatePreferences, 
    requestPermission,
    unreadCount,
    notifications
  } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(preferences);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const updateLocalPreferences = (updates: Partial<NotificationPreferences>) => {
    setLocalPreferences(prev => ({ ...prev, ...updates }));
  };

  const updateNotificationTypes = (type: keyof NotificationPreferences['types'], enabled: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled
      }
    }));
  };

  const updateQuietHours = (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    setLocalPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  const getRecentNotificationStats = () => {
    const recent = notifications.filter(notif => {
      const age = Date.now() - notif.timestamp.getTime();
      return age < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    const byType = recent.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total: recent.length, byType };
  };

  const stats = getRecentNotificationStats();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon />
          Notification Settings
          {unreadCount > 0 && (
            <Chip 
              label={unreadCount} 
              size="small" 
              color="primary" 
              sx={{ ml: 'auto' }} 
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
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
                  </Alert>
                  <Button
                    variant="contained"
                    onClick={handleRequestPermission}
                    disabled={isRequestingPermission}
                    startIcon={<NotificationsIcon />}
                    fullWidth
                  >
                    {isRequestingPermission ? 'Requesting...' : 'Enable Notifications'}
                  </Button>
                </Box>
              ) : (
                <Alert severity="success">
                  Notifications are enabled and working!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {stats.total > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity (24h)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${stats.total} notifications`} size="small" />
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <Chip 
                      key={type} 
                      label={`${count} ${type.replace('_', ' ')}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Main Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.enabled}
                onChange={(e) => updateLocalPreferences({ enabled: e.target.checked })}
                disabled={!permissionGranted}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {localPreferences.enabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
                <Typography variant="body1">
                  Enable Notifications
                </Typography>
              </Box>
            }
          />

          <Divider />

          {/* Notification Types */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.types.availabilityAlerts}
                    onChange={(e) => updateNotificationTypes('availabilityAlerts', e.target.checked)}
                    disabled={!localPreferences.enabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2">Availability Alerts</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get notified when parking spots become available
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.types.favoriteSpotUpdates}
                    onChange={(e) => updateNotificationTypes('favoriteSpotUpdates', e.target.checked)}
                    disabled={!localPreferences.enabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2">Favorite Spot Updates</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Priority alerts for your favorite parking locations
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.types.statusChanges}
                    onChange={(e) => updateNotificationTypes('statusChanges', e.target.checked)}
                    disabled={!localPreferences.enabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2">Status Changes</Typography>
                      <Typography variant="caption" color="text.secondary">
                        General parking status change notifications
                      </Typography>
                    </Box>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.types.priceDropAlerts}
                    onChange={(e) => updateNotificationTypes('priceDropAlerts', e.target.checked)}
                    disabled={!localPreferences.enabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingDownIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2">Price Drop Alerts</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get notified about parking price decreases
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </FormGroup>
          </Box>

          <Divider />

          {/* Notification Behavior */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Behavior
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.sound}
                    onChange={(e) => updateLocalPreferences({ sound: e.target.checked })}
                    disabled={!localPreferences.enabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VolumeUpIcon fontSize="small" />
                    Sound
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences.vibration}
                    onChange={(e) => updateLocalPreferences({ vibration: e.target.checked })}
                    disabled={!localPreferences.enabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VibrationIcon fontSize="small" />
                    Vibration
                  </Box>
                }
              />
            </FormGroup>
          </Box>

          <Divider />

          {/* Quiet Hours */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon />
              Quiet Hours
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.quietHours.enabled}
                  onChange={(e) => updateQuietHours('enabled', e.target.checked)}
                  disabled={!localPreferences.enabled}
                />
              }
              label="Enable quiet hours"
              sx={{ mb: 2 }}
            />

            {localPreferences.quietHours.enabled && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={localPreferences.quietHours.start}
                  onChange={(e) => updateQuietHours('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  size="small"
                  disabled={!localPreferences.enabled}
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={localPreferences.quietHours.end}
                  onChange={(e) => updateQuietHours('end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  size="small"
                  disabled={!localPreferences.enabled}
                />
              </Box>
            )}
            {localPreferences.quietHours.enabled && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                No notifications will be sent during quiet hours
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettings;
