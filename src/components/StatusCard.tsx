import {
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonText,
} from '@ionic/react';
import { BarStatus } from '../types/ble';

interface StatusCardProps {
  status: string;
  barStatus: BarStatus;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, barStatus }) => {
  return (
    <IonCard color={barStatus}>
      <IonCardContent>
        <IonGrid>
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonText>{status}</IonText>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};
