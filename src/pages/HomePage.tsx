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
} from '@ionic/react';

import { useBleConnection } from '../hooks/useBleConnection';
import { useFirmwareUpload } from '../hooks/useFirmwareUpload';
import { StatusCard } from '../components/StatusCard';
import { Dashboard } from '../components/Dashboard';
import { OtaType } from '../types/ble';
import { APP_VERSION } from '../constants/ble';

const HomePage: React.FC = () => {
  const {
    isConnected,
    deviceInfo,
    deviceRef,
    connect,
    disconnect,
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

  const handleScanClick = useCallback(async () => {
    if (isConnected) {
      await disconnect();
    }

    resetStatus();

    try {
      await connect(parseFirmwareNotification, parseCommandNotification);
    } catch (error) {
      console.error('Scan error:', error);
    }
  }, [isConnected, disconnect, resetStatus, connect, parseFirmwareNotification, parseCommandNotification]);

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
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isConnected ? deviceInfo.name : 'BLE Dashboard'}</IonTitle>
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
            onStartUpload={handleStartUpload}
            isUploading={isUploading}
            progress={progress}
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
