import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Divider,
  Alert,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../Context/NotificationContext';
import { ParkingNotification } from '../../Services/notificationService';
import NotificationSettings from './NotificationSettings';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigateToSpot?: (spotId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  open, 
  onClose, 
  onNavigateToSpot 
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    permissionGranted,
  } = useNotifications();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleNotificationClick = (notification: ParkingNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (onNavigateToSpot) {
      onNavigateToSpot(notification.spotId);
      onClose();
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    handleMenuClose();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    handleMenuClose();
  };

  const getNotificationIcon = (type: ParkingNotification['type']) => {
    switch (type) {
      case 'favorite_update':
        return <StarIcon color="primary" />;
      case 'status_change':
        return <LocationIcon color="success" />;
      case 'price_drop':
        return <TrendingDownIcon color="info" />;
      case 'availability_alert':
        return <NotificationsIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority: ParkingNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const today = new Date();
    const notifDate = new Date(notification.timestamp);
    const isToday = notifDate.toDateString() === today.toDateString();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = notifDate.toDateString() === yesterday.toDateString();

    let group = 'Older';
    if (isToday) group = 'Today';
    else if (isYesterday) group = 'Yesterday';

    if (!groups[group]) groups[group] = [];
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, ParkingNotification[]>);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Badge badgeContent={unreadCount} color="primary">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Notifications
            </Typography>
            
            <Tooltip title="More options">
              <IconButton onClick={handleMenuClick} size="small">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton onClick={() => setSettingsOpen(true)} size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {!permissionGranted && (
              <Alert severity="info" sx={{ m: 2 }}>
                Enable notifications in settings to receive parking alerts.
              </Alert>
            )}

            {notifications.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You'll see parking alerts and updates here
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                  <Box key={group}>
                    <Typography
                      variant="overline"
                      sx={{
                        px: 2,
                        py: 1,
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'block',
                        backgroundColor: 'action.hover',
                      }}
                    >
                      {group}
                    </Typography>
                    
                    {groupNotifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <ListItem
                          button
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                            '&:hover': {
                              backgroundColor: 'action.selected',
                            },
                          }}
                        >
                          <ListItemIcon>
                            {getNotificationIcon(notification.type)}
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: notification.isRead ? 400 : 600,
                                    flexGrow: 1,
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                
                                <Chip
                                  label={notification.priority}
                                  size="small"
                                  color={getPriorityColor(notification.priority)}
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 0.5 }}
                                >
                                  {notification.body}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTimestamp(notification.timestamp)}
                                  </Typography>
                                  
                                  {!notification.isRead && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'primary.main',
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        
                        {index < groupNotifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Box>
                ))}
              </List>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {notifications.length} total • {unreadCount} unread
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMarkAllRead} disabled={unreadCount === 0}>
          <MarkReadIcon sx={{ mr: 1 }} />
          Mark all as read
        </MenuItem>
        <MenuItem onClick={handleClearAll} disabled={notifications.length === 0}>
          <DeleteIcon sx={{ mr: 1 }} />
          Clear all
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <NotificationSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default NotificationPanel;
