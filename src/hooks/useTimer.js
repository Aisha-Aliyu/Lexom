import { useState, useEffect, useRef } from "react";

/**
 * Tracks elapsed seconds since the game started.
 * Stops when the game ends.
 */
export const useTimer = (isRunning) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const reset = () => setSeconds(0);

  return { seconds, reset };
};
