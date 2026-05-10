import { createTheme, alpha } from "@mui/material";

// Modern dark-first theme with vibrant accents
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#0c0c0c",
      secondary: "#737373",
    },
    divider: "rgba(0, 0, 0, 0.08)",
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h4: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h5: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h6: { fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.35 },
    subtitle1: { fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, lineHeight: 1.5 },
    body1: { fontWeight: 400, lineHeight: 1.6 },
    body2: { fontWeight: 400, lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none' as const },
    caption: { fontWeight: 400, lineHeight: 1.4 },
    overline: { fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.04)',
    '0 2px 4px rgba(0, 0, 0, 0.06)',
    '0 4px 8px rgba(0, 0, 0, 0.08)',
    '0 6px 12px rgba(0, 0, 0, 0.1)',
    '0 8px 16px rgba(0, 0, 0, 0.12)',
    '0 12px 24px rgba(0, 0, 0, 0.14)',
    '0 16px 32px rgba(0, 0, 0, 0.16)',
    '0 20px 40px rgba(0, 0, 0, 0.18)',
    '0 24px 48px rgba(0, 0, 0, 0.2)',
    '0 28px 56px rgba(0, 0, 0, 0.22)',
    '0 32px 64px rgba(0, 0, 0, 0.24)',
    '0 36px 72px rgba(0, 0, 0, 0.26)',
    '0 40px 80px rgba(0, 0, 0, 0.28)',
    '0 44px 88px rgba(0, 0, 0, 0.3)',
    '0 48px 96px rgba(0, 0, 0, 0.32)',
    '0 52px 104px rgba(0, 0, 0, 0.34)',
    '0 56px 112px rgba(0, 0, 0, 0.36)',
    '0 60px 120px rgba(0, 0, 0, 0.38)',
    '0 64px 128px rgba(0, 0, 0, 0.4)',
    '0 68px 136px rgba(0, 0, 0, 0.42)',
    '0 72px 144px rgba(0, 0, 0, 0.44)',
    '0 76px 152px rgba(0, 0, 0, 0.46)',
    '0 80px 160px rgba(0, 0, 0, 0.48)',
    '0 84px 168px rgba(0, 0, 0, 0.5)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#0c0c0c",
      paper: "#121212",
    },
    text: {
      primary: "#fafafa",
      secondary: "#a3a3a3",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h4: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h5: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h6: { fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.35 },
    subtitle1: { fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, lineHeight: 1.5 },
    body1: { fontWeight: 400, lineHeight: 1.6 },
    body2: { fontWeight: 400, lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none' as const },
    caption: { fontWeight: 400, lineHeight: 1.4 },
    overline: { fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.2)',
    '0 2px 4px rgba(0, 0, 0, 0.25)',
    '0 4px 8px rgba(0, 0, 0, 0.3)',
    '0 6px 12px rgba(0, 0, 0, 0.35)',
    '0 8px 16px rgba(0, 0, 0, 0.4)',
    '0 12px 24px rgba(0, 0, 0, 0.45)',
    '0 16px 32px rgba(0, 0, 0, 0.5)',
    '0 20px 40px rgba(0, 0, 0, 0.55)',
    '0 24px 48px rgba(0, 0, 0, 0.6)',
    '0 28px 56px rgba(0, 0, 0, 0.65)',
    '0 32px 64px rgba(0, 0, 0, 0.7)',
    '0 36px 72px rgba(0, 0, 0, 0.75)',
    '0 40px 80px rgba(0, 0, 0, 0.8)',
    '0 44px 88px rgba(0, 0, 0, 0.85)',
    '0 48px 96px rgba(0, 0, 0, 0.9)',
    '0 52px 104px rgba(0, 0, 0, 0.92)',
    '0 56px 112px rgba(0, 0, 0, 0.94)',
    '0 60px 120px rgba(0, 0, 0, 0.96)',
    '0 64px 128px rgba(0, 0, 0, 0.98)',
    '0 68px 136px rgba(0, 0, 0, 1)',
    '0 72px 144px rgba(0, 0, 0, 1)',
    '0 76px 152px rgba(0, 0, 0, 1)',
    '0 80px 160px rgba(0, 0, 0, 1)',
    '0 84px 168px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          background: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: 'rgba(12, 12, 12, 0.95)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          },
        },
      },
    },
  },
});
