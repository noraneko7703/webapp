import { useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonFooter,
  IonToolbar,
  IonButton,
  IonButtons,
  IonAlert,
} from '@ionic/react';

import { useBleConnection } from '../hooks/useBleConnection';
import { useFirmwareUpload } from '../hooks/useFirmwareUpload';
import { useDashboardData, parseBatteryNotification } from '../hooks/useDashboardData';
import { StatusCard } from '../components/StatusCard';
import { Dashboard } from '../components/Dashboard';
import { OtaType } from '../types/ble';
import { APP_VERSION } from '../constants/ble';

const HomePage: React.FC = () => {
  const {
    isConnected,
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
        header="藍牙已斷線"
        message="與裝置的藍牙連線已中斷，請重新連線。"
        buttons={['確定']}
        onDidDismiss={clearDisconnectAlert}
      />
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isConnected ? deviceInfo.name : 'Scan for nearby device'}</IonTitle>
          <IonButtons slot="end">
            {!isConnected && (
              <IonButton onClick={handleScanClick}>Scan</IonButton>
            )}
            {isConnected && (
              <IonButton onClick={handleDisconnectClick} color="danger">
                Disconnect
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {showStatus && <StatusCard status={status} barStatus={barStatus} />}

      {isConnected && (
        <IonContent>
          <Dashboard
            data={dashboardData}
            onStartUpload={handleStartUpload}
            isUploading={isUploading}
            progress={progress}
            onHeaterToggle={handleHeaterToggle}
          />
        </IonContent>
      )}

      <IonFooter>
        <IonToolbar>
          <IonTitle>{APP_VERSION}</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default HomePage;
