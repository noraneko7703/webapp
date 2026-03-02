import { useCallback } from 'react';
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

  const { data: dashboardData, updateBattery, startHeater, stopHeater } = useDashboardData();

  const handleBatteryNotification = useCallback(
    (value: DataView) => {
      const info = parseBatteryNotification(value);
      updateBattery(info);
    },
    [updateBattery]
  );

  const handleHeaterToggle = useCallback(
    (active: boolean) => {
      if (active) {
        startHeater();
      } else {
        stopHeater();
      }
    },
    [startHeater, stopHeater]
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

      await startUpload(deviceRef.current.deviceId, otaType, file);
      await disconnect();
    },
    [deviceRef, startUpload, disconnect]
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
          <span className="device-name">
            {isConnected ? deviceInfo.name : 'Searching for device…'}
          </span>
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
