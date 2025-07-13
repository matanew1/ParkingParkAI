import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useContext,
} from "react";
import { TrafficReport } from "../types/traffic";
import { TrafficService } from "../Services/trafficService";
import { TrafficContextType } from "../types/traffic";

// Initialize service outside component to prevent re-creation on renders
const trafficService = new TrafficService();

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

type TrafficProviderProps = {
  children: ReactNode;
};

export const TrafficProvider = ({ children }: TrafficProviderProps) => {
  // Traffic data states
  const [trafficReports, setTrafficReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showTrafficReports, setShowTrafficReports] = useState(false);

  const fetchTrafficData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const reports = await trafficService.fetchTrafficReports(isManualRefresh);

      setTrafficReports(reports);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching traffic data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load traffic data. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh traffic data every 2 minutes when enabled
  useEffect(() => {
    if (showTrafficReports) {
      fetchTrafficData();
      const intervalId = setInterval(() => fetchTrafficData(), 2 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [fetchTrafficData, showTrafficReports]);

  const value = useMemo(
    () => ({
      trafficReports,
      loading,
      error,
      lastUpdated,
      refreshing,
      showTrafficReports,
      fetchTrafficData,
      setShowTrafficReports,
    }),
    [
      trafficReports,
      loading,
      error,
      lastUpdated,
      refreshing,
      showTrafficReports,
      fetchTrafficData,
    ]
  );

  return (
    <TrafficContext.Provider value={value}>{children}</TrafficContext.Provider>
  );
};

export const useTrafficContext = () => {
  const context = useContext(TrafficContext);
  if (context === undefined) {
    throw new Error("useTrafficContext must be used within a TrafficProvider");
  }
  return context;
};

export default TrafficContext;