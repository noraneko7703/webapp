import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { bulbOutline } from 'ionicons/icons';

export const LedPage: React.FC = () => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon icon={bulbOutline} style={{ color: '#2dd36f' }} />
          LED Control
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        Coming soon...
      </IonCardContent>
    </IonCard>
  );
};
