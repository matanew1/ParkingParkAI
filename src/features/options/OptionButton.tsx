import React from "react";
import { IconButton, Tooltip, useMediaQuery, alpha, Button } from "@mui/material";
import { Settings } from "lucide-react";
import { OptionButtonProps } from "../../Types/opt";

const OptionButton: React.FC<OptionButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:768px)");

  // On mobile/tablet: icon-only button so the header stays clean and the
  // "Options" label can't overflow the available width.
  if (isMobile) {
    return (
      <Tooltip title="Options" arrow>
        <IconButton
          onClick={onClick}
          aria-label="Options"
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            color: "primary.main",
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          <Settings size={18} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      startIcon={<Settings size={16} />}
      sx={{
        borderRadius: 2,
        whiteSpace: "nowrap",
        ml: 1,
        px: 2,
        py: 0.75,
        minHeight: 40,
        fontWeight: 600,
        textTransform: "none",
        fontSize: "0.875rem",
        boxShadow: (theme) =>
          `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
        "&:hover": {
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      Options
    </Button>
  );
};

export default OptionButton;
