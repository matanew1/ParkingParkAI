import React, { Suspense } from "react";
import { Box, CircularProgress, Drawer, useMediaQuery } from "@mui/material";

// Lazy loaded component
const AIPopup = React.lazy(() => import("./AIPopup"));

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIDialog: React.FC<AIDialogProps> = ({ isOpen, onClose }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            maxHeight: "80vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            py: 3,
          },
        }}
      >
        <Suspense
          fallback={
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          }
        >
          <AIPopup isOpen={isOpen} onClose={onClose} />
        </Suspense>
      </Drawer>
    );
  }

  return isOpen ? (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        // Close when clicking overlay but not when clicking the dialog
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <AIPopup isOpen={isOpen} onClose={onClose} />
      </Suspense>
    </Box>
  ) : null;
};

export default AIDialog;
