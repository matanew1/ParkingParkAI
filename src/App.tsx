import React from "react";
import { ThemeProvider as CustomThemeProvider } from "./Context/ThemeContext";
import { ParkingProvider } from "./Context/ParkingContext";
import { AnimationProvider } from "./utils/AnimationProvider";
import ErrorBoundary from "./utils/ErrorBoundary";
import AppContent from "./components/AppContent";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AnimationProvider>
        <ParkingProvider>
          <CustomThemeProvider>
            <AppContent />
          </CustomThemeProvider>
        </ParkingProvider>
      </AnimationProvider>
    </ErrorBoundary>
  );
};

export default App;