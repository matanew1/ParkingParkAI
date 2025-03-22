import React from "react";
import { ThemeProvider as CustomThemeProvider } from "./context/ThemeContext";
import AppContent from "./components/AppContent";

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;
