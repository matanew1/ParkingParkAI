import React, { lazy, Suspense, useState } from 'react';
import { MapPin, Wand2, Sun, Moon } from 'lucide-react';
import { ThemeProvider as CustomThemeProvider, useTheme as useCustomTheme } from './context/ThemeContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Container, 
  Paper, 
  IconButton, 
  Button, 
  useMediaQuery, 
  CircularProgress,
  Drawer,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';

// Lazy loaded components
const ParkingMap = lazy(() => import('./components/ParkingMap'));
const AIPopup = lazy(() => import('./components/AIPopup'));

// Create responsive Material UI themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useCustomTheme();

  return (
    <IconButton 
      onClick={toggleTheme}
      color="inherit"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      sx={{ ml: 1 }}
    >
      {isDarkMode ? (
        <Sun size={20} color="#FFD700" />
      ) : (
        <Moon size={20} />
      )}
    </IconButton>
  );
};

interface AIButtonProps {
  onClick: () => void;
}

const AIButton: React.FC<AIButtonProps> = ({ onClick }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  
  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="primary"
      startIcon={<Wand2 size={20} />}
      size={isMobile ? "small" : "medium"}
      sx={{ 
        borderRadius: '20px',
        whiteSpace: 'nowrap',
        ml: 2,
      }}
    >
      {isMobile ? "AI" : "AI Menu"}
    </Button>
  );
};

const AppContent: React.FC = () => {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState<boolean>(false);
  const { isDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleOpenAIPopup = (): void => {
    setIsAIPopupOpen(true);
  };

  const handleCloseAIPopup = (): void => {
    setIsAIPopupOpen(false);
  };
  
  // Choose the appropriate MUI theme based on the custom theme state
  const muiTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="parking location"
              sx={{ mr: 2 }}
            >
              <MapPin size={24} />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" noWrap>
                Tel Aviv Parking Map
              </Typography>
              {!isMobile && (
                <Typography variant="caption" component="p" noWrap>
                  Find available parking spots in the city
                </Typography>
              )}
            </Box>
            
            <ThemeToggle />
            <AIButton onClick={handleOpenAIPopup} />
          </Toolbar>
        </AppBar>
        
        <Box component="main" sx={{ flexGrow: 1, pt: { xs: 7, sm: 8, md: 9 } }}>
          <Container maxWidth="xl" sx={{ height: '100%' }}>
            <Suspense 
              fallback={
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  minHeight="80vh"
                >
                  <CircularProgress />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading map...
                  </Typography>
                </Box>
              }
            >
              <ParkingMap />
            </Suspense>
          </Container>
        </Box>
      </Box>

      {/* AI Dialog as a drawer on mobile, modal on desktop */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={isAIPopupOpen}
          onClose={handleCloseAIPopup}
          PaperProps={{
            sx: {
              maxHeight: '80vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              px: 2,
              py: 3
            }
          }}
        >
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            <AIPopup isOpen={isAIPopupOpen} onClose={handleCloseAIPopup} />
          </Suspense>
        </Drawer>
      ) : (
        isAIPopupOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              // Close when clicking overlay but not when clicking the dialog
              if (e.target === e.currentTarget) handleCloseAIPopup();
            }}
          >
            <Paper
              elevation={24}
              sx={{
                maxWidth: 500,
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                borderRadius: 2,
                p: 3,
                zIndex: 10000,
                m: 2
              }}
            >
              <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
                <AIPopup isOpen={isAIPopupOpen} onClose={handleCloseAIPopup} />
              </Suspense>
            </Paper>
          </Box>
        )
      )}
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;