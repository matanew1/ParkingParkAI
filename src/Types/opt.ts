// src/Types/opt.ts

export interface OptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OptionButtonProps {
  onClick: () => void;
}

export interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}
