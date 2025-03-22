export interface OptionButtonProps {
  onClick: () => void;
}

export interface OptionDialogProps {
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

export interface OptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  destination: string;
}
