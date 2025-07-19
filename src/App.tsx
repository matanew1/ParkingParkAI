import React from "react";
import { ThemeProvider as CustomThemeProvider } from "./Context/ThemeContext";
import { ParkingProvider } from "./Context/ParkingContext";
import { FavoritesProvider } from "./Context/FavoritesContext";
import { NotificationProvider } from "./Context/NotificationContext";
import { AnimationProvider } from "./utils/AnimationProvider";
import ErrorBoundary from "./utils/ErrorBoundary";
import NotificationErrorBoundary from "./utils/NotificationErrorBoundary";
import AppContent from "./components/AppContent";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <ParkingProvider>
          <FavoritesProvider>
            <NotificationErrorBoundary>
              <NotificationProvider>
                <CustomThemeProvider>
                  <AppContent />
                </CustomThemeProvider>
              </NotificationProvider>
            </NotificationErrorBoundary>
          </FavoritesProvider>
        </ParkingProvider>
      </AnimationProvider>
    </ErrorBoundary>
  );
};

export default App;