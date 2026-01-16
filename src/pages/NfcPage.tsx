import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { cardOutline } from 'ionicons/icons';

export const NfcPage: React.FC = () => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon icon={cardOutline} style={{ color: '#92949c' }} />
          NFC Reader
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        Coming soon...
      </IonCardContent>
    </IonCard>
  );
};
