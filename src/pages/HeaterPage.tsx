import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { thermometerOutline } from 'ionicons/icons';

export const HeaterPage: React.FC = () => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon icon={thermometerOutline} style={{ color: '#eb445a' }} />
          Heater
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        Coming soon...
      </IonCardContent>
    </IonCard>
  );
};
