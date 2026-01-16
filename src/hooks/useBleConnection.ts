import { useState, useRef, useCallback } from 'react';
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { DeviceInfo, BleDeviceRef } from '../types/ble';
import { arrayBufferToString } from '../utils/crc';
import {
  BLE_SERVICE_UUID,
  BLE_FIRMWARE_CHAR_UUID,
  BLE_COMMAND_CHAR_UUID,
  DIS_SERVICE_UUID,
  DIS_MODEL_NUMBER_UUID,
  DIS_SERIAL_NUMBER_UUID,
  DIS_FIRMWARE_REVISION_UUID,
  DIS_HARDWARE_REVISION_UUID,
  DIS_MANUFACTURER_NAME_UUID,
  BLE_READ_TIMEOUT_MS,
} from '../constants/ble';

interface UseBleConnectionReturn {
  isConnected: boolean;
  deviceInfo: DeviceInfo;
  hasDeviceInfo: boolean;
  deviceRef: React.MutableRefObject<BleDeviceRef | null>;
  connect: (
    onFirmwareNotification: (value: DataView) => void,
    onCommandNotification: (value: DataView) => void
  ) => Promise<void>;
  disconnect: () => Promise<void>;
}

const initialDeviceInfo: DeviceInfo = {
  name: '',
  model: '',
  serialNumber: '',
  manufacturer: '',
  hwVersion: '',
  swVersion: '',
};

export function useBleConnection(): UseBleConnectionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(initialDeviceInfo);
  const [hasDeviceInfo, setHasDeviceInfo] = useState(false);
  const deviceRef = useRef<BleDeviceRef | null>(null);

  const onDisconnect = useCallback((deviceId: string) => {
    console.log(`device ${deviceId} disconnected`);
    setIsConnected(false);
  }, []);

  const readDeviceInfoCharacteristic = async (
    deviceId: string,
    charUuid: number
  ): Promise<string> => {
    try {
      const response = await BleClient.read(
        deviceId,
        numberToUUID(DIS_SERVICE_UUID),
        numberToUUID(charUuid),
        { timeout: BLE_READ_TIMEOUT_MS }
      );
      return arrayBufferToString(response.buffer);
    } catch (error) {
      console.log(`timeout reading characteristic 0x${charUuid.toString(16)}`);
      return '';
    }
  };

  const connect = useCallback(
    async (
      onFirmwareNotification: (value: DataView) => void,
      onCommandNotification: (value: DataView) => void
    ) => {
      try {
        setIsConnected(false);
        setHasDeviceInfo(false);
        setDeviceInfo(initialDeviceInfo);

        await BleClient.initialize();

        const clientDevice = await BleClient.requestDevice({
          services: [BLE_SERVICE_UUID],
          optionalServices: [numberToUUID(DIS_SERVICE_UUID)],
        });

        await BleClient.connect(clientDevice.deviceId, onDisconnect);

        deviceRef.current = {
          deviceId: clientDevice.deviceId,
          name: clientDevice.name,
        };

        console.log('Connected to device');

        // Start notifications
        await BleClient.startNotifications(
          clientDevice.deviceId,
          BLE_SERVICE_UUID,
          BLE_FIRMWARE_CHAR_UUID,
          onFirmwareNotification
        );

        await BleClient.startNotifications(
          clientDevice.deviceId,
          BLE_SERVICE_UUID,
          BLE_COMMAND_CHAR_UUID,
          onCommandNotification
        );

        // Read device information
        const [model, serialNumber, swVersion, hwVersion, manufacturer] =
          await Promise.all([
            readDeviceInfoCharacteristic(clientDevice.deviceId, DIS_MODEL_NUMBER_UUID),
            readDeviceInfoCharacteristic(clientDevice.deviceId, DIS_SERIAL_NUMBER_UUID),
            readDeviceInfoCharacteristic(clientDevice.deviceId, DIS_FIRMWARE_REVISION_UUID),
            readDeviceInfoCharacteristic(clientDevice.deviceId, DIS_HARDWARE_REVISION_UUID),
            readDeviceInfoCharacteristic(clientDevice.deviceId, DIS_MANUFACTURER_NAME_UUID),
          ]);

        const info: DeviceInfo = {
          name: clientDevice.name || '',
          model,
          serialNumber,
          manufacturer,
          hwVersion,
          swVersion,
        };

        setDeviceInfo(info);
        if (model || serialNumber || manufacturer || hwVersion || swVersion) {
          setHasDeviceInfo(true);
        }
        setIsConnected(true);
      } catch (error) {
        console.error('Connection error:', error);
        throw error;
      }
    },
    [onDisconnect]
  );

  const disconnect = useCallback(async () => {
    if (deviceRef.current) {
      await BleClient.disconnect(deviceRef.current.deviceId);
      deviceRef.current = null;
    }
    setIsConnected(false);
    setHasDeviceInfo(false);
    setDeviceInfo(initialDeviceInfo);
  }, []);

  return {
    isConnected,
    deviceInfo,
    hasDeviceInfo,
    deviceRef,
    connect,
    disconnect,
  };
}
