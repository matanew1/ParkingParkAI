import React, { useState } from 'react';
import { Menu, X, Clock, DollarSign, Car, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { ParkingSpotWithStatus } from '../types/parking';

interface SidebarProps {
  spots: ParkingSpotWithStatus[];
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
  statusError: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

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

  const filteredSpots = spots.filter(spot => 
    spot.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.Address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] bg-white shadow-lg transition-all duration-300 z-[1000] ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="p-4 h-full overflow-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search parking spots..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status information and refresh button */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={14} className="mr-1" />
                <span>
                  {lastUpdated 
                    ? `Updated: ${lastUpdated.toLocaleTimeString()}` 
                    : 'Loading data...'}
                </span>
              </div>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center"
              >
                {isRefreshing ? (
                  <RefreshCw size={14} className="mr-1 animate-spin" />
                ) : (
                  <RefreshCw size={14} className="mr-1" />
                )}
                Refresh
              </button>
            </div>

            {/* Status error notification */}
            {statusError && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle size={16} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
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
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onSpotClick(spot)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{spot.Name}</h3>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{spot.Address}</p>
                  <div className="flex items-center justify-between mt-2">
                    {spot.status ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        spot.status.InformationToShow === 'מלא'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {spot.status.InformationToShow}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-50 text-yellow-700">
                        Unknown
                      </span>
                    )}
                  </div>
                  {spot.status && (
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <Clock size={12} className="mr-1" />
                      <span>
                        Updated: {new Date(spot.status.LastUpdateFromDambach).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
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