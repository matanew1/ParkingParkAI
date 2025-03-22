import React, { useState, useContext, useEffect, useCallback } from "react";
import { X, Car, Route, MapPin, Navigation } from "lucide-react";
import { RouteService } from "../../services/routeService";
import ParkingContext from "../../context/ParkingContext";
import type { AIPopupProps, AIOption } from "../../types/ai";

const AIPopup: React.FC<AIPopupProps> = ({ isOpen, onClose }) => {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [needsDestination, setNeedsDestination] = useState<boolean>(false);

  const {
    userLocation,
    selectedSpot,
    setSelectedSpot,
    setShowLocationMarker,
    setRoutes,
  } = useContext(ParkingContext);
  const routeService = React.useMemo(() => new RouteService(), []);

  const aiOptions: AIOption[] = [
    {
      id: "route",
      title: "Optimal Route",
      description:
        "Find the optimal route to your destination with real-time traffic data",
      icon: <Route className="h-5 w-5 text-orange-500" />,
      action: () => handleAIAction("route"),
    },
  ];

  const processRouteRequest = useCallback(
    (source: [number, number], destination: string) => {
      setLocationStatus("Calculating optimal route...");
      routeService
        .fetchRoute(source, destination)
        .then((routes) => {
          console.log("Route fetched:", routes);
          setRoutes([routes]);
          setLocationStatus("Route calculated!");
          setLoadingAction(false);
          setNeedsDestination(false);
        })
        .catch((error) => {
          console.error("Error fetching route:", error);
          setLocationStatus("Error calculating route. Please try again.");
          setLoadingAction(false);
        });
    },
    [routeService, setRoutes]
  );

  const handleAIAction = useCallback(
    (optionId: string): void => {
      setActiveOption(optionId);
      setLoadingAction(true);
      setLocationStatus("Getting your current location...");

      if (optionId === "route") {
        if (!userLocation) {
          setShowLocationMarker(true); // Trigger location fetch in context
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: [number, number] = [
                position.coords.latitude,
                position.coords.longitude,
              ];
              if (!selectedSpot) {
                setLocationStatus(
                  "Please click a parking spot on the map to set your destination"
                );
                setNeedsDestination(true);
                setLoadingAction(false);
              } else {
                processRouteRequest(coords, selectedSpot);
              }
            },
            (error) => {
              console.error("Error getting location:", error);
              setLocationStatus(
                "Could not access your location. Please enable location services."
              );
              setLoadingAction(false);
            }
          );
        } else if (!selectedSpot) {
          setLocationStatus(
            "Please click a parking spot on the map to set your destination"
          );
          setNeedsDestination(true);
          setLoadingAction(false);
        } else {
          processRouteRequest(userLocation, selectedSpot);
        }
      }
    },
    [userLocation, selectedSpot, processRouteRequest, setShowLocationMarker]
  );

  // Handle destination selection without closing popup
  useEffect(() => {
    if (needsDestination && selectedSpot && userLocation) {
      setLoadingAction(true); // Show loading while processing
      processRouteRequest(userLocation, selectedSpot);
      setNeedsDestination(false);
    }
  }, [needsDestination, selectedSpot, userLocation, processRouteRequest]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-80 overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Parking AI Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close popup"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-3">
          {activeOption ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {aiOptions.find((opt) => opt.id === activeOption)?.icon}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                  {aiOptions.find((opt) => opt.id === activeOption)?.title}
                </h3>
              </div>

              {loadingAction ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {locationStatus}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  {needsDestination ? (
                    <div className="flex flex-col items-center space-y-2">
                      <MapPin className="h-6 w-6 text-red-500" />
                      <p className="text-xs text-gray-800 dark:text-gray-300 text-center">
                        {locationStatus}
                      </p>
                      <button
                        onClick={() => setNeedsDestination(true)} // Keep popup open, waiting for map click
                        className="w-full py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                      >
                        Waiting for map selection...
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Navigation className="h-4 w-4 text-green-500" />
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-300">
                          Route Information
                        </p>
                      </div>
                      <p className="text-xs text-gray-800 dark:text-gray-300">
                        {locationStatus}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            Distance:
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-300">
                            2.3 km
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            Est. Time:
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-300">
                            8 min
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setActiveOption(null);
                  setNeedsDestination(false);
                  setLocationStatus("");
                  setSelectedSpot(null); // Reset selected spot when going back
                }}
                className="w-full py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs"
              >
                Back to options
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Select an AI-powered feature to help with your parking needs:
              </p>
              <div className="space-y-2">
                {aiOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className="w-full flex items-start p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="mr-2 mt-0.5">{option.icon}</div>
                    <div className="text-left">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                        {option.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            AI suggestions based on real-time data
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIPopup;
