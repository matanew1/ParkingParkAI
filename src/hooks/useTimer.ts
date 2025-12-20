import { useState, useEffect } from "react";

interface UseTimerProps {
  initialTime: number;
  onComplete: () => void;
}

export const useTimer = ({ initialTime, onComplete }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          onComplete();
          return initialTime; // Reset timer
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialTime, onComplete]);

  // Calculate progress percentage (inverted, as we want to show time elapsed)
  const progressValue = ((initialTime - timeLeft) / initialTime) * 100;

  const resetTimer = () => {
    setTimeLeft(initialTime);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    timeLeft,
    progressValue,
    resetTimer,
    formatTime,
  };
};
