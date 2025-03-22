import React, { useState, useContext, useEffect, useCallback } from "react";
import { X, Car, Route, MapPin, Navigation } from "lucide-react";
import { RouteService } from "../../services/routeService";
import ParkingContext from "../../context/ParkingContext";
import type { OptionPopupProps, AIOption } from "../../types/ai";
import type { Coordinates } from "../../services/routeService";

const OptionPopup: React.FC<OptionPopupProps> = ({ isOpen, onClose }) => {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [needsDestination, setNeedsDestination] = useState<boolean>(false);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  const { userLocation, selectedSpot, setShowLocationMarker, setRoutes } =
    useContext(ParkingContext);

  const routeService = React.useMemo(() => new RouteService(), []);

  const aiOptions: AIOption[] = [
    {
      id: "route",
      title: "Optimal Route",
      description: "Find the best path to your spot with live traffic updates",
      icon: <Route className="h-6 w-6 text-indigo-500" />,
      action: () => handleAIAction("route"),
    },
  ];

  const decodePolyline = (polyline: string): Coordinates[] => {
    // eslint-disable-next-line prefer-const -- 'coords' is mutated, not reassigned
    let coords: Coordinates[] = [];
    let index = 0;
    const len = polyline.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = polyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += result & 1 ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;
      do {
        b = polyline.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += result & 1 ? ~(result >> 1) : result >> 1;

      coords.push([lat / 1e6, lng / 1e6]);
    }
    return coords;
  };

  const processRouteRequest = useCallback(
    async (source: Coordinates, destination: string) => {
      setLocationStatus("Calculating your optimal route...");
      try {
        const response = await routeService.fetchRoute(source, destination);
        let decodedRoute: Coordinates[];
        if (typeof response === "string") {
          decodedRoute = decodePolyline(response);
        } else if (response?.data?.trip?.legs?.[0]?.shape) {
          decodedRoute = decodePolyline(response.data.trip.legs[0].shape);
          setRouteDetails({
            distance: response.data.trip.legs[0].distance || "N/A",
            duration: response.data.trip.legs[0].duration || "N/A",
          });
        } else {
          throw new Error("Unsupported route response format");
        }

        if (decodedRoute?.length > 0) {
          setRoutes([decodedRoute]);
          if (!routeDetails) {
            const distance = `${Math.round(decodedRoute.length / 10)} km`;
            const duration = `${Math.round(decodedRoute.length / 5)} min`;
            setRouteDetails({ distance, duration });
          }
          setLocationStatus("Route ready! Happy travels!");
        } else {
          throw new Error("Invalid route data");
        }
        setLoadingAction(false);
        setNeedsDestination(false);
      } catch (error) {
        console.error("Route error:", error);
        setLocationStatus("Oops! Route calculation failed. Try again?");
        setLoadingAction(false);
      }
    },
    [routeService, setRoutes, routeDetails]
  );

  const handleAIAction = useCallback(
    (optionId: string): void => {
      setActiveOption(optionId);
      setLoadingAction(true);
      setLocationStatus("Locating you...");

      if (optionId === "route") {
        if (!userLocation) {
          setShowLocationMarker(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: Coordinates = [
                position.coords.latitude,
                position.coords.longitude,
              ];
              if (!selectedSpot) {
                setLocationStatus("Please pick a parking spot on the map");
                setNeedsDestination(true);
                setLoadingAction(false);
              } else {
                processRouteRequest(coords, selectedSpot);
              }
            },
            (error) => {
              console.error("Location error:", error);
              setLocationStatus("Location access denied. Enable it?");
              setLoadingAction(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else if (!selectedSpot) {
          setLocationStatus("Please pick a parking spot on the map");
          setNeedsDestination(true);
          setLoadingAction(false);
        } else {
          processRouteRequest(userLocation, selectedSpot);
        }
      }
    },
    [userLocation, selectedSpot, processRouteRequest, setShowLocationMarker]
  );

  useEffect(() => {
    if (needsDestination && selectedSpot && userLocation) {
      setLoadingAction(true);
      processRouteRequest(userLocation, selectedSpot);
    }
  }, [needsDestination, selectedSpot, userLocation, processRouteRequest]);

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
                {aiOptions.find((opt) => opt.id === activeOption)?.icon}
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {aiOptions.find((opt) => opt.id === activeOption)?.title}
                </h3>
              </div>

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
                        <Navigation className="h-5 w-5 text-green-500" />
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Your Route
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        {locationStatus}
                      </p>
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
                {aiOptions.map((option) => (
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

export default OptionPopup;
