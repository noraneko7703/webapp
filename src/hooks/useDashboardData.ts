import { useState, useEffect, useRef, useCallback } from 'react';
import { BatteryInfo, TemperatureData } from '../types/ble';

const MOCK_UPDATE_INTERVAL_MS = 1000;
const MAX_HISTORY_POINTS = 300;

/**
 * 解析 BLE Battery Notification (12 bytes, Little-Endian)
 * [0-1]   uint16 voltage (mV)
 * [2-3]   int16  averageCurrent (mA, signed)
 * [4-5]   uint16 stateOfCharge (%)
 * [6-7]   uint16 batteryTemp (0.1°C, e.g. 305 = 30.5°C)
 * [8-9]   uint16 heaterStatus (0=off, 1=on)
 * [10-11] uint16 heaterTemperature (0.1°C)
 */
export function parseBatteryNotification(value: DataView): BatteryInfo {
  const voltage = value.getUint16(0, true);
  const averageCurrent = value.getInt16(2, true);
  const stateOfCharge = value.getUint16(4, true);
  const batteryTemp = value.getUint16(6, true) / 10;
  const heaterStatus = value.getUint16(8, true);
  const heaterTemperature = value.getUint16(10, true) / 10;

  return { voltage, averageCurrent, stateOfCharge, batteryTemp, heaterStatus, heaterTemperature };
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
    heaterStatus: 0,
    heaterTemperature: 25,
  });
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureData[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHeaterActiveRef = useRef(false);
  const previousHeaterStatusRef = useRef(0);

  const updateBattery = useCallback((info: BatteryInfo) => {
    setBattery(info);
    setTemperature(info.heaterTemperature);

    // Detect heaterStatus change
    const prevStatus = previousHeaterStatusRef.current;
    const currentStatus = info.heaterStatus;
    previousHeaterStatusRef.current = currentStatus;

    // State transition: heaterStatus 0 → 1
    if (prevStatus === 0 && currentStatus === 1) {
      isHeaterActiveRef.current = true;
      setIsHeaterActive(true);
      setElapsedTime(0);
      setTemperatureHistory([]);
    }
    // State transition: heaterStatus 1 → 0
    else if (prevStatus === 1 && currentStatus === 0) {
      isHeaterActiveRef.current = false;
      setIsHeaterActive(false);
    }

    // Always update temperature history when data is received from BLE device (0x8024)
    const now = Math.floor(Date.now() / 1000);
    setTemperatureHistory((hist) => {
      const updated = [...hist, { timestamp: now, temperature: info.heaterTemperature }];
      return updated.slice(-MAX_HISTORY_POINTS);
    });
  }, []);

  const startHeater = useCallback(() => {
    isHeaterActiveRef.current = true;
    setIsHeaterActive(true);
    setElapsedTime(0);
    setTemperatureHistory([]);
    setTemperature(25);
  }, []);

  const stopHeater = useCallback(() => {
    isHeaterActiveRef.current = false;
    setIsHeaterActive(false);
  }, []);

  useEffect(() => {
    if (!isHeaterActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
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
