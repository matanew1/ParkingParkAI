import React from "react";
import { Button, useMediaQuery, alpha } from "@mui/material";
import { Settings } from "lucide-react";
import { OptionButtonProps } from "../../Types/app";

const OptionButton: React.FC<OptionButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const isSmallMobile = useMediaQuery("(max-width:480px)");

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      size={isSmallMobile ? "small" : "medium"}
      startIcon={!isSmallMobile && <Settings size={isMobile ? 14 : 16} />}
      sx={{
        borderRadius: 3,
        whiteSpace: "nowrap",
        ml: { xs: 0.5, sm: 1 },
        px: { xs: 1.5, sm: 2 },
        py: { xs: 0.75, sm: 1 },
        minHeight: { xs: 36, sm: 40 },
        fontWeight: 600,
        textTransform: 'none',
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        '&:hover': {
          boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {isSmallMobile ? "AI" : isMobile ? "Options" : "AI Assistant"}
    </Button>
  );
};

export default OptionButton;
