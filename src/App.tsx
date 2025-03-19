import { MapPin, Wand2 } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ParkingMap = lazy(() => import('./components/ParkingMap'));

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg hover:shadow-xl"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-gray-600" />
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
        </>
      )}
    </button>
  );
}

function AIButton() {
  const handleAIRequest = () => {
    console.log('AI Tool Activated');
    // Replace the console log with your AI tool's integration logic
  };

  return (
    <button
      onClick={handleAIRequest}
      className="flex items-center p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all border border-blue-400 dark:border-blue-600 shadow-lg hover:shadow-xl"
      aria-label="Activate AI Tool"
    >
      <Wand2 className="h-5 w-5" />
      <span className="ml-3 text-sm font-medium">AI Magic</span>
    </button>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-all">
      <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-300 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-500" aria-label="Parking location icon" />
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tel Aviv Parking Map
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find available parking spots in the city
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <AIButton />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 sm:pt-28">
        <Suspense fallback={<div className="text-gray-600 dark:text-gray-300">Loading map...</div>}>
          <ParkingMap />
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
