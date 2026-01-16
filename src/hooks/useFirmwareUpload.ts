import { useState, useRef, useCallback } from 'react';
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { Buffer } from 'buffer';
import { OtaType, UploadProgress, BarStatus } from '../types/ble';
import { crc16 } from '../utils/crc';
import {
  BLE_SERVICE_UUID,
  BLE_FIRMWARE_CHAR_UUID,
  BLE_COMMAND_CHAR_UUID,
  OTA_PACKET_SIZE,
  OTA_SECTOR_SIZE,
  OTA_TIMEOUT_MS,
  OTA_POLL_INTERVAL_MS,
  OTA_CMD_START_APP,
  OTA_CMD_STOP,
  OTA_CMD_START_SPIFFS,
  OTA_RESPONSE_OK,
  OTA_RESPONSE_CRC_ERROR,
  OTA_RESPONSE_INDEX_ERROR,
  OTA_RESPONSE_PAYLOAD_ERROR,
} from '../constants/ble';

interface UseFirmwareUploadReturn {
  isUploading: boolean;
  progress: UploadProgress;
  status: string;
  barStatus: BarStatus;
  showStatus: boolean;
  startUpload: (deviceId: string, otaType: OtaType, file: ArrayBuffer) => Promise<void>;
  parseFirmwareNotification: (value: DataView) => void;
  parseCommandNotification: (value: DataView) => void;
  resetStatus: () => void;
}

export function useFirmwareUpload(): UseFirmwareUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ percent: 0, speed: 0 });
  const [status, setStatus] = useState('');
  const [barStatus, setBarStatus] = useState<BarStatus>('danger');
  const [showStatus, setShowStatus] = useState(false);

  // Use refs for values that need to be accessed in notification callbacks
  const cmdStatusRef = useRef(0);
  const fwStatusRef = useRef(0);
  const expectedIndexRef = useRef(0);

  const resetStatus = useCallback(() => {
    setShowStatus(false);
    setStatus('');
  }, []);

  const waitForResponse = useCallback(
    (statusRef: React.MutableRefObject<number>, timeout: number): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        if (statusRef.current === 1) {
          resolve(true);
          return;
        }

        let intervalId: NodeJS.Timeout | null = null;

        const checkCondition = () => {
          if (statusRef.current === 1) {
            if (intervalId !== null) {
              clearInterval(intervalId);
              intervalId = null;
            }
            resolve(true);
          }
        };

        intervalId = setInterval(checkCondition, OTA_POLL_INTERVAL_MS);

        setTimeout(() => {
          if (intervalId !== null) {
            clearInterval(intervalId);
            console.log('Response timeout');
            resolve(false);
          }
        }, timeout);
      });
    },
    []
  );

  const sendFirmwarePackets = useCallback(
    async (deviceId: string, file: ArrayBuffer): Promise<boolean> => {
      const startTime = Date.now();
      let index = 0;
      let writtenSize = 0;

      while (writtenSize < file.byteLength) {
        let sectorSize = 0;
        let sequence = 0;
        let crc = 0;
        let isLastPacket = false;

        const sector = file.slice(writtenSize, writtenSize + OTA_SECTOR_SIZE);
        if (sector.byteLength === 0) break;

        while (sectorSize < sector.byteLength) {
          let toRead = OTA_PACKET_SIZE - 3;
          if (sectorSize + toRead > sector.byteLength) {
            toRead = sector.byteLength - sectorSize;
            isLastPacket = true;
          }

          const sectorData = sector.slice(sectorSize, sectorSize + toRead);
          sectorSize += toRead;

          if (sectorSize >= OTA_SECTOR_SIZE) isLastPacket = true;

          crc = crc16(crc, new Uint8Array(sectorData, 0, sectorData.byteLength), sectorData.byteLength);

          if (isLastPacket) sequence = 0xff;

          let packet = Buffer.alloc(toRead + 3);
          packet[0] = index & 0xff;
          packet[1] = (index >> 8) & 0xff;
          packet[2] = sequence;
          Buffer.from(sectorData).copy(packet, 3);

          writtenSize += sectorData.byteLength;

          if (isLastPacket) {
            const percent = Math.round((100 * writtenSize) / file.byteLength);
            const speed = (writtenSize * 1000) / 1024 / (Date.now() - startTime);
            setProgress({ percent, speed });

            const crcData = Buffer.alloc(2);
            crcData[0] = crc & 0xff;
            crcData[1] = (crc >> 8) & 0xff;
            packet = Buffer.concat([packet, crcData]);
          }

          fwStatusRef.current = 0;
          expectedIndexRef.current = index;

          await BleClient.writeWithoutResponse(
            deviceId,
            BLE_SERVICE_UUID,
            BLE_FIRMWARE_CHAR_UUID,
            numbersToDataView(Array.prototype.slice.call(packet))
          );

          if (isLastPacket && fwStatusRef.current === 0) {
            const ack = await waitForResponse(fwStatusRef, OTA_TIMEOUT_MS);
            if (!ack) {
              setBarStatus('danger');
              setShowStatus(true);
              console.log('FW NACK');
              return false;
            }
          }

          sequence++;
        }
        index++;
      }
      return true;
    },
    [waitForResponse]
  );

  const sendCommand = useCallback(
    async (deviceId: string, command: number, fileSize?: number): Promise<boolean> => {
      const buffer = Buffer.alloc(20);
      buffer[0] = command;
      buffer[1] = 0x00;

      if (fileSize !== undefined) {
        buffer.writeUInt32LE(fileSize, 2);
      }

      const crc = crc16(0, buffer, 18);
      buffer.writeUInt16LE(crc, 18);

      cmdStatusRef.current = 0;

      await BleClient.write(
        deviceId,
        BLE_SERVICE_UUID,
        BLE_COMMAND_CHAR_UUID,
        numbersToDataView(Array.prototype.slice.call(buffer))
      );

      const ack = await waitForResponse(cmdStatusRef, OTA_TIMEOUT_MS);
      if (!ack) {
        setBarStatus('danger');
        setShowStatus(true);
        console.log('Command NACK');
        return false;
      }
      return true;
    },
    [waitForResponse]
  );

  const startUpload = useCallback(
    async (deviceId: string, otaType: OtaType, file: ArrayBuffer) => {
      if (otaType === 'undefined') return;

      setIsUploading(true);
      setProgress({ percent: 0, speed: 0 });
      setShowStatus(false);

      const startCmd = otaType === 'app' ? OTA_CMD_START_APP : OTA_CMD_START_SPIFFS;
      console.log(`Start ${otaType.toUpperCase()} OTA`);

      // Send start command
      const startAck = await sendCommand(deviceId, startCmd, file.byteLength);
      if (!startAck) {
        setIsUploading(false);
        return;
      }

      console.log('Start command acknowledged');

      // Send firmware data
      const uploadSuccess = await sendFirmwarePackets(deviceId, file);
      if (!uploadSuccess) {
        setIsUploading(false);
        return;
      }

      // Send stop command
      console.log('Stop OTA');
      const stopAck = await sendCommand(deviceId, OTA_CMD_STOP);
      if (!stopAck) {
        setIsUploading(false);
        return;
      }

      setStatus('OTA Done');
      setBarStatus('success');
      setShowStatus(true);
      setIsUploading(false);
    },
    [sendCommand, sendFirmwarePackets]
  );

  const parseFirmwareNotification = useCallback((value: DataView): void => {
    if (value.buffer.byteLength < 20) return;

    const crc = value.getUint16(18, true);
    const crcCalc = crc16(0, new Uint8Array(value.buffer, 0, 18), 18);

    if (crcCalc !== crc) return;

    const fwAns = value.getUint16(2, true);
    const receivedIndex = value.getUint16(0, true);

    if (fwAns === OTA_RESPONSE_OK && expectedIndexRef.current === receivedIndex) {
      fwStatusRef.current = 1;
    } else if (fwAns === OTA_RESPONSE_CRC_ERROR && expectedIndexRef.current === receivedIndex) {
      fwStatusRef.current = 0;
      setStatus('CRC Error');
      console.log('CRC Error');
    } else if (fwAns === OTA_RESPONSE_INDEX_ERROR) {
      fwStatusRef.current = 0;
      setStatus('Index Error');
      console.log('Index Error');
    } else if (fwAns === OTA_RESPONSE_PAYLOAD_ERROR && expectedIndexRef.current === receivedIndex) {
      fwStatusRef.current = 0;
      setStatus('Payload length Error');
      console.log('Payload length Error');
    }
  }, []);

  const parseCommandNotification = useCallback((value: DataView): void => {
    if (value.buffer.byteLength < 20) return;

    const crc = value.getUint16(18, true);
    const crcCalc = crc16(0, new Uint8Array(value.buffer, 0, 18), 18);

    if (crcCalc !== crc) return;

    const cmdType = value.getUint16(0, true);
    const cmdCode = value.getUint16(2, true);

    if (cmdType !== 3) return;
    if (cmdCode !== 1 && cmdCode !== 2 && cmdCode !== 4) return;

    const ans = value.getUint16(4, true);

    if (ans === 0) {
      cmdStatusRef.current = 1;
      console.log('Command OK', value);
    } else if (ans === 1) {
      cmdStatusRef.current = 0;
      if (cmdCode === 1) setStatus('NACK on START command');
      else if (cmdCode === 2) setStatus('NACK on STOP command');
    } else if (ans === 3) {
      cmdStatusRef.current = 0;
      setStatus('Signature Error');
    }
  }, []);

  return {
    isUploading,
    progress,
    status,
    barStatus,
    showStatus,
    startUpload,
    parseFirmwareNotification,
    parseCommandNotification,
    resetStatus,
  };
}
