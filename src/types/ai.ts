export interface AIButtonProps {
  onClick: () => void;
}

export interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AIOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface AIPopupProps {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  destination: string;
}
