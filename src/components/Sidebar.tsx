// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Clock, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { SidebarProps } from '../types/parking';

const Sidebar: React.FC<SidebarProps> = ({ 
  spots, 
  onSpotClick, 
  statusError, 
  lastUpdated, 
  onRefresh, 
  isRefreshing 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredSpots = spots.filter(spot => 
    spot.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    spot.Address.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

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
                onClick={onRefresh}
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
            {statusError && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-300 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Status information is temporarily unavailable. Parking availability may not be accurate.
                  </p>
                </div>
              </div>
            )}
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
                    {spot.status ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        spot.status.InformationToShow === 'מלא'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {spot.status.InformationToShow}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                        Unknown
                      </span>
                    )}
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