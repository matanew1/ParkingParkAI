import { createTheme, alpha } from "@mui/material";

const BLUE = {
  main: "#2563EB",
  light: "#60A5FA",
  dark: "#1D4ED8",
};

const MINT = {
  main: "#10B981",
  light: "#34D399",
  dark: "#047857",
};

const AMBER = "#F59E0B";
const CORAL = "#EF4444";

const typographyConfig = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: { fontWeight: 800, letterSpacing: 0, lineHeight: 1.08 },
  h2: { fontWeight: 800, letterSpacing: 0, lineHeight: 1.12 },
  h3: { fontWeight: 750, letterSpacing: 0, lineHeight: 1.16 },
  h4: { fontWeight: 750, letterSpacing: 0, lineHeight: 1.2 },
  h5: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.25 },
  h6: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.3 },
  subtitle1: { fontWeight: 600, letterSpacing: 0, lineHeight: 1.45 },
  subtitle2: { fontWeight: 600, letterSpacing: 0, lineHeight: 1.45 },
  body1: { fontWeight: 400, letterSpacing: 0, lineHeight: 1.6 },
  body2: { fontWeight: 400, letterSpacing: 0, lineHeight: 1.5 },
  button: { fontWeight: 700, letterSpacing: 0, textTransform: "none" as const },
  caption: { fontWeight: 500, letterSpacing: 0, lineHeight: 1.35 },
  overline: {
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  },
};

const shapeConfig = { borderRadius: 8 };

const lightShadows = [
  "none",
  "0 1px 2px rgba(15, 23, 42, 0.06)",
  "0 2px 6px rgba(15, 23, 42, 0.07)",
  "0 4px 10px rgba(15, 23, 42, 0.08)",
  "0 8px 18px rgba(15, 23, 42, 0.09)",
  "0 12px 24px rgba(15, 23, 42, 0.1)",
  "0 16px 32px rgba(15, 23, 42, 0.11)",
  "0 20px 40px rgba(15, 23, 42, 0.12)",
  "0 24px 48px rgba(15, 23, 42, 0.13)",
  "0 28px 56px rgba(15, 23, 42, 0.14)",
  "0 32px 64px rgba(15, 23, 42, 0.15)",
  "0 36px 72px rgba(15, 23, 42, 0.16)",
  "0 40px 80px rgba(15, 23, 42, 0.17)",
  "0 44px 88px rgba(15, 23, 42, 0.18)",
  "0 48px 96px rgba(15, 23, 42, 0.19)",
  "0 52px 104px rgba(15, 23, 42, 0.2)",
  "0 56px 112px rgba(15, 23, 42, 0.21)",
  "0 60px 120px rgba(15, 23, 42, 0.22)",
  "0 64px 128px rgba(15, 23, 42, 0.23)",
  "0 68px 136px rgba(15, 23, 42, 0.24)",
  "0 72px 144px rgba(15, 23, 42, 0.25)",
  "0 76px 152px rgba(15, 23, 42, 0.26)",
  "0 80px 160px rgba(15, 23, 42, 0.27)",
  "0 84px 168px rgba(15, 23, 42, 0.28)",
  "0 88px 176px rgba(15, 23, 42, 0.29)",
];

const darkShadows = [
  "none",
  "0 1px 2px rgba(0, 0, 0, 0.22)",
  "0 2px 6px rgba(0, 0, 0, 0.26)",
  "0 4px 10px rgba(0, 0, 0, 0.3)",
  "0 8px 18px rgba(0, 0, 0, 0.34)",
  "0 12px 24px rgba(0, 0, 0, 0.38)",
  "0 16px 32px rgba(0, 0, 0, 0.42)",
  "0 20px 40px rgba(0, 0, 0, 0.46)",
  "0 24px 48px rgba(0, 0, 0, 0.5)",
  "0 28px 56px rgba(0, 0, 0, 0.54)",
  "0 32px 64px rgba(0, 0, 0, 0.58)",
  "0 36px 72px rgba(0, 0, 0, 0.62)",
  "0 40px 80px rgba(0, 0, 0, 0.66)",
  "0 44px 88px rgba(0, 0, 0, 0.7)",
  "0 48px 96px rgba(0, 0, 0, 0.74)",
  "0 52px 104px rgba(0, 0, 0, 0.78)",
  "0 56px 112px rgba(0, 0, 0, 0.82)",
  "0 60px 120px rgba(0, 0, 0, 0.86)",
  "0 64px 128px rgba(0, 0, 0, 0.9)",
  "0 68px 136px rgba(0, 0, 0, 0.92)",
  "0 72px 144px rgba(0, 0, 0, 0.94)",
  "0 76px 152px rgba(0, 0, 0, 0.95)",
  "0 80px 160px rgba(0, 0, 0, 0.96)",
  "0 84px 168px rgba(0, 0, 0, 0.97)",
  "0 88px 176px rgba(0, 0, 0, 0.98)",
];

const buildComponents = (primaryMain: string) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: "thin",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none" as const,
        fontWeight: 750,
        borderRadius: 8,
        padding: "10px 18px",
        boxShadow: "none",
        transition:
          "background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "none",
        },
      },
      contained: {
        boxShadow: `0 10px 24px ${alpha(primaryMain, 0.22)}`,
        "&:hover": {
          boxShadow: `0 14px 30px ${alpha(primaryMain, 0.28)}`,
        },
      },
      outlined: {
        borderColor: alpha(primaryMain, 0.24),
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        borderRadius: 8,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 750,
        borderRadius: 999,
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
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: `0 12px 28px ${alpha(primaryMain, 0.28)}`,
        "&:hover": {
          boxShadow: `0 16px 36px ${alpha(primaryMain, 0.34)}`,
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: BLUE.main,
      light: BLUE.light,
      dark: BLUE.dark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: MINT.main,
      light: MINT.light,
      dark: MINT.dark,
      contrastText: "#FFFFFF",
    },
    error: {
      main: CORAL,
    },
    warning: {
      main: AMBER,
    },
    success: {
      main: MINT.main,
      light: MINT.light,
      dark: MINT.dark,
    },
    info: {
      main: "#0891B2",
    },
    background: {
      default: "#F4F7FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#101828",
      secondary: "#667085",
    },
    divider: "rgba(16, 24, 40, 0.1)",
  },
  typography: typographyConfig,
  shape: shapeConfig,
  shadows: lightShadows,
  components: buildComponents(BLUE.main),
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: BLUE.light,
      light: "#93C5FD",
      dark: BLUE.main,
      contrastText: "#07111F",
    },
    secondary: {
      main: MINT.light,
      light: "#6EE7B7",
      dark: MINT.main,
      contrastText: "#04130E",
    },
    error: {
      main: "#F87171",
    },
    warning: {
      main: "#FBBF24",
    },
    success: {
      main: MINT.light,
      light: "#6EE7B7",
      dark: MINT.main,
    },
    info: {
      main: "#22D3EE",
    },
    background: {
      default: "#111315",
      paper: "#191C20",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#A7B0BE",
    },
    divider: "rgba(248, 250, 252, 0.12)",
  },
  typography: typographyConfig,
  shape: shapeConfig,
  shadows: darkShadows,
  components: buildComponents(BLUE.light),
});
