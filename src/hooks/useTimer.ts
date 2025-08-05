import { useState, useEffect, useRef } from "react";

interface TimerState {
  curMS: number;
  deltaTime: number;
  avgDeltaTime: number;
}

interface TimerOptions {
  avgDeltaRate?: number;
  scale?: number;
}

export const useTimer = ({ avgDeltaRate = 0.7, scale = 1 }: TimerOptions = {}) => {
  const [timerState, setTimerState] = useState<TimerState>({
    curMS: 0,
    deltaTime: 0,
    avgDeltaTime: 0,
  });

  const msRateRef = useRef(0.001 * scale);
  const prevMSRef = useRef(0);
  const bootMSRef = useRef(Date.now() * msRateRef.current);

  useEffect(() => {
    const updateTime = () => {
      const curMS = Date.now() * msRateRef.current;
      const prevMS = prevMSRef.current;

      const deltaTime = curMS - prevMS;
      const avgDeltaTime =
        timerState.deltaTime * (1.0 - avgDeltaRate) + deltaTime * avgDeltaRate;

      prevMSRef.current = curMS;

      setTimerState({
        curMS,
        deltaTime,
        avgDeltaTime,
      });
    };

    const interval = setInterval(updateTime, 16); // Approx. 60 FPS

    return () => clearInterval(interval);
  }, [avgDeltaRate]);

  const scaleTime = (scale: number) => {
    msRateRef.current = 0.001 * scale;
  };

  const getLerpRate = (rate: number) => {
    return 1.0 - Math.pow(0.5, timerState.deltaTime * rate);
  };

  const getLerpAvgRate = (rate: number) => {
    return 1.0 - Math.pow(0.5, timerState.avgDeltaTime * rate);
  };

  return {
    timerState,
    scaleTime,
    getLerpRate,
    getLerpAvgRate,
  };
};
