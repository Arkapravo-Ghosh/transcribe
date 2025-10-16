import { useState, useEffect, useRef } from "react";

export const useTimer = (isActive: boolean) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      setElapsedTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive]);

  const resetTimer = () => setElapsedTime(0);

  return { elapsedTime, resetTimer };
};
