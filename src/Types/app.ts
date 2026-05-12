export interface AppHeaderProps {
  onOpenOptionPopup: () => void;
  onNavigateToSpot?: (spotId: string) => void;
  onOpenNotifications?: () => void;
  notificationPanelOpen?: boolean;
  onCloseNotifications?: () => void;
}
