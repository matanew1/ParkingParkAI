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
      description: "Find the best path to your spot with live traffic updates",
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
      className="fixed top-20 right-6 z-50 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-96 max-h-[80vh] overflow-y-auto border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center space-x-3">
            <Car className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Parking Buddy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeOption ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {options.find((opt) => opt.id === activeOption)?.icon}
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {options.find((opt) => opt.id === activeOption)?.title}
                </h3>
              </div>

              {/* Route preferences UI (only shown for route option) */}
              {activeOption === "route" &&
                !loadingAction &&
                !needsDestination && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-2">
                    <div className="flex items-center mb-2">
                      <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Route Preferences
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={routePreferences.shortest}
                          onChange={(e) =>
                            setRoutePreferences({
                              ...routePreferences,
                              shortest: e.target.checked,
                            })
                          }
                          className="rounded text-indigo-600 mr-2"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          Prefer shortest distance over fastest time
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={routePreferences.avoidHighways}
                          onChange={(e) =>
                            setRoutePreferences({
                              ...routePreferences,
                              avoidHighways: e.target.checked,
                            })
                          }
                          className="rounded text-indigo-600 mr-2"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          Avoid highways
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={routePreferences.avoidTolls}
                          onChange={(e) =>
                            setRoutePreferences({
                              ...routePreferences,
                              avoidTolls: e.target.checked,
                            })
                          }
                          className="rounded text-indigo-600 mr-2"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          Avoid toll roads
                        </span>
                      </label>

                      <button
                        onClick={() => {
                          if (userLocation && selectedSpot) {
                            setLoadingAction(true);
                            processRouteRequest(userLocation, selectedSpot);
                          }
                        }}
                        disabled={!userLocation || !selectedSpot}
                        className="w-full mt-2 py-1.5 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        Apply Preferences
                      </button>
                    </div>
                  </div>
                )}

              {loadingAction ? (
                <div className="flex flex-col items-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {locationStatus}
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-inner">
                  {needsDestination ? (
                    <div className="flex flex-col items-center space-y-4">
                      <MapPin className="h-8 w-8 text-red-500 animate-bounce" />
                      <p className="text-sm text-gray-700 dark:text-gray-200 text-center font-medium">
                        {locationStatus}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
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
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Distance
                            </span>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              {routeDetails?.distance || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Time
                            </span>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
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
                className="w-full py-2.5 px-4 bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-gray-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-medium"
              >
                Back to Options
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">
                Your AI-powered parking assistant awaits!
              </p>
              <div className="space-y-3">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className="w-full flex items-start p-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100 dark:border-gray-800 hover:shadow-md"
                  >
                    <div className="mr-3 mt-1">{option.icon}</div>
                    <div className="text-left">
                      <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button className="w-full flex items-center justify-center py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <HelpCircle className="h-4 w-4 mr-1.5" />
                  Need help with parking?
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Matan Bardugo &middot; Tel Aviv Parking Map
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptionPopup);
