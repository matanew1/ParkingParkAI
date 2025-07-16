import React from "react";
import { Button, useMediaQuery, alpha } from "@mui/material";
import { Settings } from "lucide-react";
import { OptionButtonProps } from "../../Types/app";

const OptionButton: React.FC<OptionButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      size={isMobile ? "small" : "medium"}
      startIcon={<Settings size={16} />}
      sx={{
        borderRadius: 3,
        whiteSpace: "nowrap",
        ml: 1,
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        '&:hover': {
          boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {isMobile ? "Options" : "AI Assistant"}
    </Button>
  );
};

export default OptionButton;
