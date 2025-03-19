// src/App.tsx
import { lazy, Suspense } from 'react';
import { MapPin, Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const ParkingMap = lazy(() => import('./components/ParkingMap'));

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          <span className="ml-2 text-gray-900 dark:text-gray-100">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-gray-600" />
          <span className="ml-2 text-gray-900 dark:text-gray-100">Dark Mode</span>
        </>
      )}
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-500" aria-label="Parking location icon" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Tel Aviv Parking Map
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Find available parking spots in the city
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="pt-16">
          <Suspense fallback={<div className="text-gray-600 dark:text-gray-300">Loading map...</div>}>
            <ParkingMap />
          </Suspense>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;