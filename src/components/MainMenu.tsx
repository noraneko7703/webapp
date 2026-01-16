import {
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {
  cloudUploadOutline,
  bulbOutline,
  volumeHighOutline,
  thermometerOutline,
  cardOutline,
} from 'ionicons/icons';
import { MenuPage, MenuItem } from '../types/menu';
import './MainMenu.css';

interface MainMenuProps {
  onSelectPage: (page: MenuPage) => void;
}

const menuItems: MenuItem[] = [
  { id: 'ota', title: 'OTA Update', icon: cloudUploadOutline, color: '#3880ff' },
  { id: 'led', title: 'LED Control', icon: bulbOutline, color: '#2dd36f' },
  { id: 'buzzer', title: 'Buzzer', icon: volumeHighOutline, color: '#ffc409' },
  { id: 'heater', title: 'Heater', icon: thermometerOutline, color: '#eb445a' },
  { id: 'nfc', title: 'NFC Reader', icon: cardOutline, color: '#92949c' },
];

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectPage }) => {
  return (
    <IonGrid>
      <IonRow>
        {menuItems.map((item) => (
          <IonCol size="6" key={item.id}>
            <IonCard
              className="menu-card"
              button
              onClick={() => onSelectPage(item.id)}
            >
              <IonCardContent className="menu-card-content">
                <IonIcon
                  icon={item.icon}
                  style={{ fontSize: '48px', color: item.color }}
                />
                <IonLabel className="menu-label">{item.title}</IonLabel>
              </IonCardContent>
            </IonCard>
          </IonCol>
        ))}
      </IonRow>
    </IonGrid>
  );
};
