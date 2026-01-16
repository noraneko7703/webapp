import { useCallback, useState } from 'react';
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
import { DeviceInfoCard } from '../components/DeviceInfoCard';
import { StatusCard } from '../components/StatusCard';
import { MainMenu } from '../components/MainMenu';
import { OtaPage } from './OtaPage';
import { LedPage } from './LedPage';
import { BuzzerPage } from './BuzzerPage';
import { HeaterPage } from './HeaterPage';
import { NfcPage } from './NfcPage';
import { OtaType } from '../types/ble';
import { MenuPage } from '../types/menu';
import { APP_VERSION } from '../constants/ble';

const HomePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<MenuPage>('menu');

  const {
    isConnected,
    deviceInfo,
    hasDeviceInfo,
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
    setCurrentPage('menu');

    try {
      await connect(parseFirmwareNotification, parseCommandNotification);
    } catch (error) {
      console.error('Scan error:', error);
    }
  }, [isConnected, disconnect, resetStatus, connect, parseFirmwareNotification, parseCommandNotification]);

  const handleDisconnectClick = useCallback(async () => {
    setCurrentPage('menu');
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

  const handleBackToMenu = () => {
    setCurrentPage('menu');
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'menu':
        return (
          <>
            {hasDeviceInfo && <DeviceInfoCard deviceInfo={deviceInfo} />}
            <MainMenu onSelectPage={setCurrentPage} />
          </>
        );
      case 'ota':
        return (
          <OtaPage
            isUploading={isUploading}
            progress={progress}
            onStartUpload={handleStartUpload}
          />
        );
      case 'led':
        return <LedPage />;
      case 'buzzer':
        return <BuzzerPage />;
      case 'heater':
        return <HeaterPage />;
      case 'nfc':
        return <NfcPage />;
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {isConnected && currentPage !== 'menu' && (
            <IonButtons slot="start">
              <IonButton onClick={handleBackToMenu}>
                ← Back
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>
            {!isConnected && (
              <IonButton onClick={handleScanClick}>Scan</IonButton>
            )}
            {isConnected && (
              <IonButton
                className="ion-float-right"
                onClick={handleDisconnectClick}
                color="danger"
              >
                Disconnect
              </IonButton>
            )}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {showStatus && <StatusCard status={status} barStatus={barStatus} />}

      {isConnected && (
        <IonContent className="ion-padding">
          <h1>{deviceInfo.name}</h1>
          {renderPageContent()}
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
