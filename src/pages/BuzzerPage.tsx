import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { volumeHighOutline } from 'ionicons/icons';

export const BuzzerPage: React.FC = () => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon icon={volumeHighOutline} style={{ color: '#ffc409' }} />
          Buzzer
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        Coming soon...
      </IonCardContent>
    </IonCard>
  );
};
