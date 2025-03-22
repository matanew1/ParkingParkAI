import React from "react";
import { ThemeProvider as CustomThemeProvider } from "./context/ThemeContext";
import { ParkingProvider } from "./context/ParkingContext";
import AppContent from "./components/AppContent";

const App: React.FC = () => {
  return (
    <ParkingProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </ParkingProvider>
  );
};

export default App;
