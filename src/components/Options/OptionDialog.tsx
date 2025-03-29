import React, { Suspense } from "react";
import {
  Box,
  CircularProgress,
  Drawer,
  useMediaQuery,
  Theme,
} from "@mui/material";
import type { OptionDialogProps } from "../../Types/app";

// Lazy loaded component
const OptionPopup = React.lazy(() => import("./OptionPopup"));

const OptionDialog: React.FC<OptionDialogProps> = ({ isOpen, onClose }) => {
  // More specific breakpoints for different device sizes
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between("sm", "md")
  );

  // Loading fallback component
  const LoadingFallback = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
        minHeight: isMobile ? "100px" : "150px",
      }}
    >
      <CircularProgress size={isMobile ? 30 : 40} />
    </Box>
  );

  // For mobile devices: bottom drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            maxHeight: "90vh", // Slightly larger to give more space on small devices
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: { xs: 1.5, sm: 2 }, // Responsive padding
            py: { xs: 2, sm: 3 }, // Responsive padding
            overflow: "auto",
          },
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <OptionPopup isOpen={isOpen} onClose={onClose} />
        </Suspense>
      </Drawer>
    );
  }

  // For tablets: side drawer
  if (isTablet) {
    return (
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "50%", // Half width on tablets
            px: 3,
            py: 3,
          },
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <OptionPopup isOpen={isOpen} onClose={onClose} />
        </Suspense>
      </Drawer>
    );
  }

  // For desktop: modal dialog with overlay
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
        p: { md: 2, lg: 4 }, // Responsive padding
      }}
      onClick={(e) => {
        // Close when clicking overlay but not when clicking the dialog
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Box
        sx={{
          maxWidth: { md: "500px", lg: "600px", xl: "700px" }, // Responsive width
          width: "90%",
          maxHeight: "85vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          overflow: "auto",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <OptionPopup isOpen={isOpen} onClose={onClose} />
        </Suspense>
      </Box>
    </Box>
  ) : null;
};

export default OptionDialog;
