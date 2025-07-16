import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Car,
  Route,
  MapPin,
  Navigation,
  Clock,
  Umbrella,
  ParkingSquare,
  BarChart4,
  Filter,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useParkingContext } from "../../Context/ParkingContext";
import type { OptionPopupProps, Option } from "../../Types/ai";
import type { Coordinates } from "../../Services/routeService";

const OptionPopup: React.FC<OptionPopupProps> = ({ isOpen, onClose }) => {
  // State management
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [needsDestination, setNeedsDestination] = useState<boolean>(false);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [routePreferences, setRoutePreferences] = useState({
    avoidTolls: false,
    avoidHighways: false,
    shortest: false,
  });

  // Get context data
  const {
    userLocation,
    selectedSpot,
    setShowLocationMarker,
    setRoutes,
    fetchUserLocation,
    fetchRoute,
  } = useParkingContext();

  // Available options
  const options: Option[] = [
    {
      id: "route",
      title: "Optimal Route",
      description: "Find the best path to your spot with optimal routing",
      icon: <Route className="h-6 w-6 text-indigo-500" />,
      action: () => handleAIAction("route"),
    },
  ];

  // Process route request with better error handling
  const processRouteRequest = useCallback(
    async (source: Coordinates, destination: string) => {
      setLocationStatus("Calculating your optimal route...");
      try {
        const trip = await fetchRoute(source, destination, {
          shortest: routePreferences.shortest,
          avoidTolls: routePreferences.avoidTolls,
          avoidHighways: routePreferences.avoidHighways,
        });

        setRouteDetails({
          distance: trip.summary.length.toFixed(2) + " km",
          duration: Math.round(trip.summary.time / 60) + " min",
        });

        setLocationStatus("Route ready! Happy travels!");
        setLoadingAction(false);
        setNeedsDestination(false);
      } catch (error) {
        console.error("Route error:", error);
        setLocationStatus("Oops! Route calculation failed. Try again?");
        setLoadingAction(false);
      }
    },
    [fetchRoute, routePreferences]
  );

  // Handle AI action selection
  const handleAIAction = useCallback(
    (optionId: string): void => {
      setActiveOption(optionId);
      setLoadingAction(true);
      setLocationStatus("Locating you...");

      if (optionId === "route") {
        if (!selectedSpot) {
          setLocationStatus("Please pick a parking spot on the map");
          setNeedsDestination(true);
          setLoadingAction(false);
        } else if (!userLocation && navigator.geolocation) {
          setShowLocationMarker(true);

          // Try to get location
          fetchUserLocation()
            .then((coords) => {
              if (!selectedSpot) {
                setLocationStatus("Please pick a parking spot on the map");
                setNeedsDestination(true);
                setLoadingAction(false);
              } else {
                processRouteRequest(coords, selectedSpot);
              }
            })
            .catch((error) => {
              console.error("Location error:", error);
              setLocationStatus("Location access denied. Enable it?");
              setLoadingAction(false);
            });
        } else if (userLocation && selectedSpot) {
          processRouteRequest(userLocation, selectedSpot);
        }
      }
    },
    [
      userLocation,
      selectedSpot,
      processRouteRequest,
      setShowLocationMarker,
      fetchUserLocation,
    ]
  );

  // Effect to process route when needed
  useEffect(() => {
    if (needsDestination && selectedSpot && userLocation) {
      setLoadingAction(true);
      processRouteRequest(userLocation, selectedSpot);
    }
  }, [needsDestination, selectedSpot, userLocation, processRouteRequest]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed top-20 right-6 z-50"
      onClick={(e) => e.stopPropagation()}
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div 
        className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto border border-gray-200/20 dark:border-gray-700/20"
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200/20 dark:border-gray-700/20"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Options
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enhance your parking experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeOption ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                  {options.find((opt) => opt.id === activeOption)?.icon}
                </div>
                <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                  {options.find((opt) => opt.id === activeOption)?.title}
                </h3>
              </div>

              {/* Route preferences UI (only shown for route option) */}
              {activeOption === "route" &&
                !loadingAction &&
                !needsDestination && (
                  <div className="bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center mb-3">
                      <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300 mr-2" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Route Preferences
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: 'shortest', label: 'Prefer shortest distance over fastest time' },
                        { key: 'avoidHighways', label: 'Avoid highways' },
                        { key: 'avoidTolls', label: 'Avoid toll roads' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={routePreferences[key]}
                            onChange={(e) =>
                              setRoutePreferences({
                                ...routePreferences,
                                [key]: e.target.checked,
                              })
                            }
                            className="rounded text-indigo-600 mr-3 w-4 h-4"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {label}
                          </span>
                        </label>
                      ))}

                      <button
                        onClick={() => {
                          if (userLocation && selectedSpot) {
                            setLoadingAction(true);
                            processRouteRequest(userLocation, selectedSpot);
                          }
                        }}
                        disabled={!userLocation || !selectedSpot}
                        className="w-full mt-3 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                      >
                        Apply Preferences
                      </button>
                    </div>
                  </div>
                )}

              {loadingAction ? (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium text-center">
                    {locationStatus}
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50/80 to-blue-50/80 dark:from-gray-800/50 dark:to-gray-700/50 p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  {needsDestination ? (
                    <div className="flex flex-col items-center space-y-4">
                      <MapPin className="h-10 w-10 text-red-500 animate-bounce" />
                      <p className="text-sm text-gray-700 dark:text-gray-200 text-center font-medium">
                        {locationStatus}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {activeOption === "route" && (
                          <Navigation className="h-5 w-5 text-green-500" />
                        )}
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {
                            options.find((opt) => opt.id === activeOption)
                              ?.title
                          }
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        {locationStatus}
                      </p>
                      {activeOption === "route" && routeDetails && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                              Distance
                            </span>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">
                              {routeDetails?.distance || "N/A"}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                              Time
                            </span>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">
                              {routeDetails?.duration || "N/A"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setActiveOption(null);
                  setNeedsDestination(false);
                  setLocationStatus("");
                  setRouteDetails(null);
                }}
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-semibold"
              >
                ← Back to Options
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
                Choose an AI-powered feature to enhance your parking experience
              </p>
              <div className="space-y-3">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className="w-full flex items-start p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-gray-600 group"
                  >
                    <div className="mr-4 mt-1 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800/50 dark:group-hover:to-purple-800/50 transition-all duration-200">
                      {option.icon}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button className="w-full flex items-center justify-center py-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Need help with parking?
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/20 dark:border-gray-700/20 text-center rounded-b-2xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Matan Bardugo • Tel Aviv Parking Map
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptionPopup);
