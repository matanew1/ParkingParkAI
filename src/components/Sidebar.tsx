import React, { useState } from 'react';
import { Menu, X, Clock, DollarSign, Car, ChevronRight } from 'lucide-react';
import type { ParkingSpotWithStatus } from '../types/parking';

interface SidebarProps {
  spots: ParkingSpotWithStatus[];
  onSpotClick: (spot: ParkingSpotWithStatus) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ spots, onSpotClick }) => {
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

          <div className="space-y-2">
            {filteredSpots.map((spot) => (
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
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Car size={14} className="mr-1" />
                      <span>{spot.MaximumPublicOccupancy} spots</span>
                    </div>
                    {spot.DaytimeFee && (
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span>Paid</span>
                      </div>
                    )}
                  </div>
                  {spot.status && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      spot.status.InformationToShow === 'מלא'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {spot.status.InformationToShow}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;