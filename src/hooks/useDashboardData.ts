import { useState, useEffect, useRef, useCallback } from 'react';
import { BatteryInfo, TemperatureData } from '../types/ble';

const MOCK_UPDATE_INTERVAL_MS = 1000;
const MAX_HISTORY_POINTS = 6000;

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

  // Debug: log raw bytes to diagnose temperature=0 issue
  // const raw: string[] = [];
  // for (let i = 0; i < value.byteLength; i++) {
  //   raw.push(value.getUint8(i).toString(16).padStart(2, '0'));
  // }
  // console.group(`%c[BLE Battery] ${value.byteLength}B packet`, 'color:#ff9500;font-weight:bold');
  // console.log(`RAW bytes : ${raw.join(' ')}`);
  // console.log(`[0-1]  voltage          : ${voltage} mV`);
  // console.log(`[2-3]  averageCurrent   : ${averageCurrent} mA`);
  // console.log(`[4-5]  stateOfCharge    : ${stateOfCharge} %`);
  // console.log(`[6-7]  batteryTemp      : ${batteryTemp} °C  (raw uint16=${value.getUint16(6, true)})`);
  // console.log(`[8-9]  heaterStatus     : ${heaterStatus}  (0=off, 1=on)`);
  // console.log(`[10-11] heaterTemp      : ${heaterTemperature} °C  (raw uint16=${value.getUint16(10, true)})`);
  // if (value.byteLength >= 14) {
  //   console.log(`[12-13] bytes 12-13   : ${value.getUint8(12).toString(16).padStart(2,'0')} ${value.getUint8(13).toString(16).padStart(2,'0')}  (uint16=${value.getUint16(12, true)})`);
  // }
  // if (value.byteLength >= 16) {
  //   console.log(`[14-15] bytes 14-15   : ${value.getUint8(14).toString(16).padStart(2,'0')} ${value.getUint8(15).toString(16).padStart(2,'0')}  (uint16=${value.getUint16(14, true)})`);
  // }
  // console.groupEnd();

  // [12-19] NFC-V UID (8 bytes)
  let nfcUid = '';
  if (value.byteLength >= 20) {
    const parts: string[] = [];
    for (let i = 12; i < 20; i++) {
      parts.push(value.getUint8(i).toString(16).padStart(2, '0').toUpperCase());
    }
    nfcUid = parts.join('');
  }

  return { voltage, averageCurrent, stateOfCharge, batteryTemp, heaterStatus, heaterTemperature, nfcUid };
}

export function useDashboardData() {
  const [isHeaterActive, setIsHeaterActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [battery, setBattery] = useState<BatteryInfo>({
    voltage: 0,
    averageCurrent: 0,
    stateOfCharge: 0,
    batteryTemp: 0,
    heaterStatus: 0,
    heaterTemperature: 0,
    nfcUid: '',
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

    // Stop timer when temperature reaches 130°C
    if (info.heaterTemperature >= 130 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only update temperature history when heater is active
    if (isHeaterActiveRef.current) {
      const now = Math.floor(Date.now() / 1000);
      setTemperatureHistory((hist) => {
        const updated = [...hist, { timestamp: now, temperature: info.heaterTemperature }];
        return updated.slice(-MAX_HISTORY_POINTS);
      });
    }
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

  const resetData = useCallback(() => {
    isHeaterActiveRef.current = false;
    previousHeaterStatusRef.current = 0;
    setIsHeaterActive(false);
    setElapsedTime(0);
    setTemperature(0);
    setTemperatureHistory([]);
    setBattery({ voltage: 0, averageCurrent: 0, stateOfCharge: 0, batteryTemp: 0, heaterStatus: 0, heaterTemperature: 0, nfcUid: '' });
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
    resetData,
  };
}
