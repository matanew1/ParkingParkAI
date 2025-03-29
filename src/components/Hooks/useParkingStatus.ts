// hooks/useParkingStatus.ts
import { useState, useEffect } from "react";

export const useParkingStatus = () => {
  const [lastValidStatus, setLastValidStatus] = useState(null);
  const [cachedData, setCachedData] = useState(null);
  
  useEffect(() => {
    const cachedStatus = localStorage.getItem("lastValidStatus");
    if (cachedStatus) {
      setCachedData(JSON.parse(cachedStatus));
    }
  }, []);
  
  const handleSpotStatus = (spot) => {
    if (spot.status && spot.status.InformationToShow !== "Unknown") {
      return spot.status.InformationToShow;
    }
    if (cachedData) {
      return cachedData;
    }
    return "Status unavailable... Please refresh again";
  };
  
  return {
    lastValidStatus,
    setLastValidStatus,
    cachedData,
    setCachedData,
    handleSpotStatus
  };
};