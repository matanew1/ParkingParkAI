import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { SidebarProps } from '../types/parking';
import { AxiosError } from 'axios';

const Sidebar: React.FC<SidebarProps> = ({ 
  spots, 
  onSpotClick, 
  lastUpdated, 
  onRefresh, 
  isRefreshing 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lastValidStatus, setLastValidStatus] = useState<any>(null); // Track last valid status
  const [cachedData, setCachedData] = useState<any>(null); // Track cached data
  
  useEffect(() => {
    // Try to load cached data on mount
    const cachedStatus = localStorage.getItem('lastValidStatus');
    if (cachedStatus) {
      setCachedData(JSON.parse(cachedStatus));
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredSpots = spots.filter(spot => 
    spot.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    spot.Address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Handle refresh error, and preserve last valid status or use cache
  const handleRefresh = async () => {
    try {
      await onRefresh(); // Assuming onRefresh will handle the fetch and update status
      setLastValidStatus(null); // Reset last valid status on refresh attempt
    } catch (error) {
      // Check if the error is an AxiosError
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 500) {
          // Preserve last valid status if error code is 500, and try to load from cache
          setLastValidStatus(lastValidStatus);
          const cachedStatus = localStorage.getItem('lastValidStatus');
          if (cachedStatus) {
            setCachedData(JSON.parse(cachedStatus)); // Use cached data if available
          }
        } else {
          setLastValidStatus(null); // Reset on other types of errors
          setCachedData(null); // Clear cache on errors
        }
      } else {
        // Handle non-AxiosError or unknown error types
        setLastValidStatus(null);
        setCachedData(null);
      }
    }
  };

  const handleSpotStatus = (spot: any) => {
    if (spot.status && spot.status.InformationToShow !== 'Unknown') {
      // If the spot status is not 'Unknown', return the current status
      return spot.status.InformationToShow;
    }
    // If the status is "Unknown", use the last valid status from cache (if available)
    if (cachedData) {
      return cachedData;
    }
    // If there is no valid status, return the string "Status unavailable" or similar
    return 'Status unavailable... Please refresh again'
  };
  

  return (
    <div 
      className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-[1000] ${
        isOpen ? 'w-80 sm:w-[70vw] max-w-sm' : 'w-12 sm:w-12'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-8 top-4 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={20} className="text-gray-600 dark:text-gray-300" /> : <Menu size={20} className="text-gray-600 dark:text-gray-300" />}
      </button>

      {isOpen && (
        <div className="p-4 h-full overflow-auto text-gray-900 dark:text-gray-100">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search parking spots..."
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search for parking spots"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
              <Clock size={14} className="mr-1" />
              <span>
                {lastUpdated 
                  ? `Updated: ${lastUpdated.toLocaleTimeString()}` 
                  : 'Loading data...'}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center"
              >
                {isRefreshing ? (
                  <RefreshCw size={14} className="mr-1 animate-spin" />
                ) : (
                  <RefreshCw size={14} className="mr-1" />
                )}
                Refresh
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredSpots.length > 0 ? (
              filteredSpots.map((spot) => (
                <div
                  key={spot.AhuzotCode}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => onSpotClick(spot)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select parking spot: ${spot.Name}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{spot.Name}</h3>
                    <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{spot.Address}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      handleSpotStatus(spot) === 'מלא'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {handleSpotStatus(spot)}
                    </span>
                  </div>
                  {spot.status && (
                    <div className="flex items-center mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>
                        Updated: {new Date(spot.status.LastUpdateFromDambach).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No parking spots match your search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
