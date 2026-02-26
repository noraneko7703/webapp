// BLE Service and Characteristic UUIDs
export const BLE_SERVICE_UUID = '00008018-0000-1000-8000-00805f9b34fb';
export const BLE_FIRMWARE_CHAR_UUID = '00008020-0000-1000-8000-00805f9b34fb';
export const BLE_COMMAND_CHAR_UUID = '00008022-0000-1000-8000-00805f9b34fb';
export const BLE_BATTERY_CHAR_UUID = '00008024-0000-1000-8000-00805f9b34fb';

// Device Information Service (DIS) UUIDs
export const DIS_SERVICE_UUID = 0x180a;
export const DIS_MODEL_NUMBER_UUID = 0x2a24;
export const DIS_SERIAL_NUMBER_UUID = 0x2a25;
export const DIS_FIRMWARE_REVISION_UUID = 0x2a26;
export const DIS_HARDWARE_REVISION_UUID = 0x2a27;
export const DIS_MANUFACTURER_NAME_UUID = 0x2a29;

// OTA Configuration
export const OTA_PACKET_SIZE = 510;
export const OTA_SECTOR_SIZE = 4096;
export const OTA_TIMEOUT_MS = 5000;
export const OTA_POLL_INTERVAL_MS = 50;
export const BLE_READ_TIMEOUT_MS = 500;

// OTA Command Types
export const OTA_CMD_START_APP = 0x01;
export const OTA_CMD_STOP = 0x02;
export const OTA_CMD_START_SPIFFS = 0x04;

// OTA Response Codes
export const OTA_RESPONSE_OK = 0;
export const OTA_RESPONSE_CRC_ERROR = 1;
export const OTA_RESPONSE_INDEX_ERROR = 2;
export const OTA_RESPONSE_PAYLOAD_ERROR = 3;

// App Version

export const APP_VERSION = 'Version 0.04';
