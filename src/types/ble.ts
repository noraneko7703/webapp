export type OtaType = 'app' | 'spiffs' | 'undefined';

export type BarStatus = 'success' | 'danger' | 'warning';

export interface DeviceInfo {
  name: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  hwVersion: string;
  swVersion: string;
}

export interface UploadProgress {
  percent: number;
  speed: number; // kB/s
}

export interface OtaState {
  isConnected: boolean;
  isFileLoaded: boolean;
  isUploading: boolean;
  status: string;
  barStatus: BarStatus;
  showStatus: boolean;
}

export interface BleDeviceRef {
  deviceId: string;
  name?: string;
}

export interface TemperatureData {
  timestamp: number;
  temperature: number;
}

export interface BatteryInfo {
  voltage: number;
  averageCurrent: number;
  stateOfCharge: number;
  batteryTemp: number;
}

export interface DashboardData {
  temperature: number;
  targetTemperature: number;
  elapsedTime: number;
  battery: BatteryInfo;
  temperatureHistory: TemperatureData[];
}

export type ControlButton = 'power' | 'nfc' | 'heater' | 'charger' | 'ota';
