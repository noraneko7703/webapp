import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { DeviceInfo } from '../types/ble';

interface DeviceInfoCardProps {
  deviceInfo: DeviceInfo;
}

export const DeviceInfoCard: React.FC<DeviceInfoCardProps> = ({ deviceInfo }) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Device Information</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonCardSubtitle>Manufacturer: {deviceInfo.manufacturer}</IonCardSubtitle>
              <IonCardSubtitle>Model: {deviceInfo.model}</IonCardSubtitle>
              <IonCardSubtitle>HW Version: {deviceInfo.hwVersion}</IonCardSubtitle>
              <IonCardSubtitle>FW Version: {deviceInfo.swVersion}</IonCardSubtitle>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};
