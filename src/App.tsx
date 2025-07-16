import React from "react";
import { ThemeProvider as CustomThemeProvider } from "./Context/ThemeContext";
import { ParkingProvider } from "./Context/ParkingContext";
import { FavoritesProvider } from "./Context/FavoritesContext";
import { AnimationProvider } from "./utils/AnimationProvider";
import ErrorBoundary from "./utils/ErrorBoundary";
import AppContent from "./components/AppContent";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <ParkingProvider>
          <FavoritesProvider>
            <CustomThemeProvider>
              <AppContent />
            </CustomThemeProvider>
          </FavoritesProvider>
        </ParkingProvider>
      </AnimationProvider>
    </ErrorBoundary>
  );
};

export default App;