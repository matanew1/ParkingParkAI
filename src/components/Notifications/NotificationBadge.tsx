import React from 'react';
import {
  IconButton,
  Badge,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../Context/NotificationContext';

interface NotificationBadgeProps {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  onClick, 
  size = 'medium' 
}) => {
  const { unreadCount, permissionGranted, preferences } = useNotifications();

  const getTooltipText = () => {
    if (!permissionGranted) {
      return 'Notifications disabled - Click to enable';
    }
    if (!preferences.enabled) {
      return 'Notifications turned off in settings';
    }
    if (unreadCount === 0) {
      return 'No new notifications';
    }
    return `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
  };

  const getIconColor = () => {
    if (!permissionGranted || !preferences.enabled) {
      return 'action';
    }
    return 'inherit';
  };

  return (
    <Tooltip title={getTooltipText()}>
      <IconButton
        onClick={onClick}
        size={size}
        color={getIconColor()}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Fade in={true} timeout={300}>
          <Badge
            badgeContent={unreadCount}
            color="primary"
            max={99}
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiBadge-badge': {
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                  },
                },
              },
            }}
          >
            {permissionGranted && preferences.enabled ? (
              <NotificationsIcon />
            ) : (
              <NotificationsOffIcon />
            )}
          </Badge>
        </Fade>
      </IconButton>
    </Tooltip>
  );
};

export { NotificationBadge };
export default NotificationBadge;
