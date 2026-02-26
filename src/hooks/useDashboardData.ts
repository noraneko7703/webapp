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

/**
 * 解析 BLE Battery Notification (8 bytes, Little-Endian, 全部 uint16)
 * [0-1] uint16 voltage (mV)
 * [2-3] uint16 averageCurrent (mA)
 * [4-5] uint16 stateOfCharge (%)
 * [6-7] uint16 temperature (0.1°C, e.g. 305 = 30.5°C)
 */
export function parseBatteryNotification(value: DataView): BatteryInfo {
  const voltage = value.getUint16(0, true);
  const averageCurrent = value.getInt16(2, true);
  const stateOfCharge = value.getUint16(4, true);
  const batteryTemp = value.getUint16(6, true) / 10;

  return { voltage, averageCurrent, stateOfCharge, batteryTemp };
}

export function useDashboardData() {
  const [isHeaterActive, setIsHeaterActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [battery, setBattery] = useState<BatteryInfo>({
    voltage: 0,
    averageCurrent: 0,
    stateOfCharge: 0,
    batteryTemp: 0,
  });
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureData[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateBattery = useCallback((info: BatteryInfo) => {
    setBattery(info);
  }, []);

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
    updateBattery,
    startHeater,
    stopHeater,
  };
}
