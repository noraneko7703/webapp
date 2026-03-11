import { useCallback, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonAlert,
} from '@ionic/react';

import { useBleConnection } from '../hooks/useBleConnection';
import { useFirmwareUpload } from '../hooks/useFirmwareUpload';
import { useDashboardData, parseBatteryNotification } from '../hooks/useDashboardData';
import { StatusCard } from '../components/StatusCard';
import { Dashboard } from '../components/Dashboard';
import { OtaType } from '../types/ble';
import { APP_VERSION } from '../constants/ble';
import './HomePage.css';

const HomePage: React.FC = () => {
  const {
    isConnected,
    isScanning,
    disconnectedUnexpectedly,
    deviceInfo,
    deviceRef,
    connect,
    disconnect,
    clearDisconnectAlert,
    expectDisconnect,
    sendHeaterCommand,
  } = useBleConnection();

  const {
    isUploading,
    progress,
    status,
    barStatus,
    showStatus,
    startUpload,
    parseFirmwareNotification,
    parseCommandNotification,
    resetStatus,
  } = useFirmwareUpload();

  const { data: dashboardData, updateBattery, startHeater, stopHeater, resetData } = useDashboardData();
  const wasConnectedRef = useRef(false);
  const otaCompletedRef = useRef(false);
  const prevIsUploadingRef = useRef(false);

  // 偵測 OTA 完成：讓 OtaPage 的 10 秒倒數跑完再 reload，而不是立即 reload
  useEffect(() => {
    if (prevIsUploadingRef.current && !isUploading && progress.percent === 100) {
      otaCompletedRef.current = true;
    }
    prevIsUploadingRef.current = isUploading;
  }, [isUploading, progress.percent]);

  useEffect(() => {
    if (isConnected) {
      wasConnectedRef.current = true;
      otaCompletedRef.current = false;
    } else if (wasConnectedRef.current && !otaCompletedRef.current) {
      resetData();
      window.location.reload();
    }
  }, [isConnected, resetData]);

  const handleBatteryNotification = useCallback(
    (value: DataView) => {
      const info = parseBatteryNotification(value);
      updateBattery(info);
    },
    [updateBattery]
  );

  const handleHeaterToggle = useCallback(
    async (active: boolean) => {
      await sendHeaterCommand(active);
      if (active) {
        startHeater();
      } else {
        stopHeater();
      }
    },
    [sendHeaterCommand, startHeater, stopHeater]
  );

  const handleScanClick = useCallback(async () => {
    if (isConnected) {
      await disconnect();
    }

    resetStatus();

    try {
      await connect(parseFirmwareNotification, parseCommandNotification, handleBatteryNotification);
    } catch (error) {
      console.error('Scan error:', error);
    }
  }, [isConnected, disconnect, resetStatus, connect, parseFirmwareNotification, parseCommandNotification, handleBatteryNotification]);

  const handleDisconnectClick = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleStartUpload = useCallback(
    async (otaType: OtaType, file: ArrayBuffer) => {
      if (!deviceRef.current) return;

      expectDisconnect(); // OTA 後裝置會重開機斷線，預先標記為預期斷線以避免 Alert
      await startUpload(deviceRef.current.deviceId, otaType, file);
      await disconnect();
    },
    [deviceRef, startUpload, disconnect, expectDisconnect]
  );

  return (
    <IonPage>
      <IonAlert
        isOpen={disconnectedUnexpectedly}
        header="Bluetooth Disconnected"
        message="The Bluetooth connection to the device was lost. Please reconnect."
        buttons={['OK']}
        onDidDismiss={clearDisconnectAlert}
      />

      <div className="app-header">
        <div className="app-header-left">
          <span className={`connection-dot ${isConnected ? 'connected' : ''}`} />
          <div className="device-name-block">
            <span className="device-name">
              {isConnected ? deviceInfo.name : 'Please scan to connect the device.'}
            </span>
            {isConnected && (deviceInfo.manufacturer || deviceInfo.swVersion) && (
              <span className="device-sub">
                {[deviceInfo.manufacturer, deviceInfo.swVersion].filter(Boolean).join(' Firmware version: ')}
              </span>
            )}
          </div>
        </div>
        <div className="app-header-right">
          <span className="app-version">{APP_VERSION}</span>
          {isConnected && (
            <button className="disconnect-btn" onClick={handleDisconnectClick}>
              Disconnect
            </button>
          )}
        </div>
      </div>

      {showStatus && <StatusCard status={status} barStatus={barStatus} />}

      <IonContent>
        <Dashboard
          data={dashboardData}
          onStartUpload={handleStartUpload}
          isUploading={isUploading}
          progress={progress}
          onHeaterToggle={handleHeaterToggle}
          isConnected={isConnected}
          isScanning={isScanning}
          onScan={handleScanClick}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
