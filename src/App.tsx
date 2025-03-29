import React from "react";
import { ThemeProvider as CustomThemeProvider } from "./Context/ThemeContext";
import { ParkingProvider } from "./Context/ParkingContext";
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
