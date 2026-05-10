import React, { useState } from "react";
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
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNotificationStore, NotificationItem } from "../../stores/notificationStore";
import NotificationSettings from "./NotificationSettings";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigateToSpot?: (spotId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  open,
  onClose,
  onNavigateToSpot,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    permissionGranted,
  } = useNotificationStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.spotId && onNavigateToSpot) {
      onNavigateToSpot(notification.spotId);
      onClose();
    }
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleMarkAllRead = () => {
    markAllAsRead();
    handleMenuClose();
  };

  const handleClearAll = () => {
    clearNotifications();
    handleMenuClose();
  };

  const getNotificationIcon = (notification: NotificationItem) => {
    if (notification.priority === "high") return <StarIcon color="warning" />;
    if (notification.type === "success") return <LocationIcon color="success" />;
    return <NotificationsIcon color="primary" />;
  };

  const getPriorityChipColor = (
    priority: NotificationItem["priority"]
  ): "error" | "warning" | "info" | "default" => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const ts = new Date(timestamp);
    const diff = now.getTime() - ts.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return ts.toLocaleDateString();
  };

  const groupedNotifications = notifications.reduce<Record<string, NotificationItem[]>>(
    (groups, notification) => {
      const today = new Date();
      const notifDate = new Date(notification.timestamp);
      const isToday = notifDate.toDateString() === today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = notifDate.toDateString() === yesterday.toDateString();
      const group = isToday ? "Today" : isYesterday ? "Yesterday" : "Older";
      if (!groups[group]) groups[group] = [];
      groups[group].push(notification);
      return groups;
    },
    {}
  );

  const groupOrder = ["Today", "Yesterday", "Older"];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            maxWidth: "100vw",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
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
              <IconButton onClick={e => setMenuAnchor(e.currentTarget)} size="small">
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
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {!permissionGranted && (
              <Alert
                severity="info"
                sx={{ m: 2 }}
                action={
                  <Button
                    size="small"
                    onClick={() => setSettingsOpen(true)}
                  >
                    Enable
                  </Button>
                }
              >
                Enable notifications to receive parking alerts.
              </Alert>
            )}

            {notifications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <NotificationsIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You&apos;ll see parking alerts and updates here
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {groupOrder
                  .filter(g => groupedNotifications[g]?.length)
                  .map(group => (
                    <Box key={group}>
                      <Typography
                        variant="overline"
                        sx={{
                          px: 2,
                          py: 1,
                          color: "text.secondary",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "block",
                          backgroundColor: "action.hover",
                        }}
                      >
                        {group}
                      </Typography>

                      {groupedNotifications[group].map((notification, index) => (
                        <React.Fragment key={notification.id}>
                          <ListItem
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                              cursor: notification.spotId ? "pointer" : "default",
                              backgroundColor: notification.read
                                ? "transparent"
                                : "action.hover",
                              "&:hover": { backgroundColor: "action.selected" },
                              pr: 1,
                            }}
                            secondaryAction={
                              <Tooltip title="Remove">
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={e => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemIcon>
                              {getNotificationIcon(notification)}
                            </ListItemIcon>

                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: notification.read ? 400 : 600,
                                      flexGrow: 1,
                                    }}
                                  >
                                    {notification.title}
                                  </Typography>
                                  {notification.priority && (
                                    <Chip
                                      label={notification.priority}
                                      size="small"
                                      color={getPriorityChipColor(notification.priority)}
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: "0.65rem" }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimestamp(notification.timestamp)}
                                    </Typography>
                                    {!notification.read && (
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",
                                          backgroundColor: "primary.main",
                                        }}
                                      />
                                    )}
                                    {notification.spotId && (
                                      <Typography
                                        variant="caption"
                                        color="primary.main"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        Tap to view
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>

                          {index < groupedNotifications[group].length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Box>
                  ))}
              </List>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {notifications.length} total · {unreadCount} unread
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* More options menu */}
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

      <NotificationSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default NotificationPanel;
