import { useState, useEffect, useRef, useCallback } from 'react';
import { BatteryInfo, TemperatureData } from '../types/ble';

const MOCK_UPDATE_INTERVAL_MS = 1000;
const MAX_HISTORY_POINTS = 300;

function generateMockTemperature(elapsed: number): number {
  const target = 130;
  const tau = 30;
  const overshoot = 15;

  if (elapsed < 2) return 25;
  const t = elapsed - 2;
  const response =
    target -
    (target - 25) * Math.exp(-t / tau) +
    overshoot * Math.exp(-t / (tau * 0.5)) * Math.sin(t / (tau * 0.3));
  return Math.max(25, Math.min(160, response));
}

function generateMockBattery(): BatteryInfo {
  return {
    voltage: 3814 + Math.floor(Math.random() * 20 - 10),
    averageCurrent: 140 + Math.floor(Math.random() * 10 - 5),
    stateOfCharge: 30,
    batteryTemp: 30 + Math.floor(Math.random() * 2),
  };
}

export function useDashboardData() {
  const [isHeaterActive, setIsHeaterActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [battery, setBattery] = useState<BatteryInfo>({
    voltage: 3814,
    averageCurrent: 140,
    stateOfCharge: 30,
    batteryTemp: 30,
  });
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureData[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHeater = useCallback(() => {
    setIsHeaterActive(true);
    setElapsedTime(0);
    setTemperatureHistory([]);
    setTemperature(25);
  }, []);

  const stopHeater = useCallback(() => {
    setIsHeaterActive(false);
  }, []);

  useEffect(() => {
    if (!isHeaterActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 1;
        const temp = generateMockTemperature(next);
        setTemperature(temp);
        const now = Math.floor(Date.now() / 1000);
        setTemperatureHistory((hist) => {
          const updated = [...hist, { timestamp: now, temperature: temp }];
          return updated.slice(-MAX_HISTORY_POINTS);
        });
        setBattery(generateMockBattery());
        return next;
      });
    }, MOCK_UPDATE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHeaterActive]);

  return {
    data: {
      temperature,
      targetTemperature: 130,
      elapsedTime,
      battery,
      temperatureHistory,
    },
    isHeaterActive,
    startHeater,
    stopHeater,
  };
}
