export type MenuPage = 'menu' | 'ota' | 'led' | 'buzzer' | 'heater' | 'nfc';

export interface MenuItem {
  id: MenuPage;
  title: string;
  icon: string;
  color: string;
}
