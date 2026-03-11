import { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import {
  cardOutline,
  flameOutline,
  flashOutline,
  bluetoothOutline,
} from 'ionicons/icons';
import { BatteryInfo } from '../types/ble';
import './StatusPanel.css';

interface StatusPanelProps {
  battery: BatteryInfo;
  isConnected: boolean;
  isScanning: boolean;
}

interface StatusItem {
  id: string;
  label: string;
  icon: any;
  active: boolean;
  scanning?: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  battery,
  isConnected,
  isScanning,
}) => {
  const isCharging = battery.averageCurrent > 0;
  const hasNfc = battery.nfcUid.length > 0 && !/^0+$/.test(battery.nfcUid);

  const statusItems = useMemo<StatusItem[]>(() => [
    { id: 'ota',     label: isScanning ? 'Scanning...' : isConnected ? 'Bluetooth ON' : 'Bluetooth OFF', icon: bluetoothOutline, active: isConnected, scanning: isScanning },
    { id: 'nfc',     label: hasNfc ? 'NFC ON' : 'NFC OFF',                              icon: cardOutline,     active: hasNfc },
    { id: 'heater',  label: battery.heaterStatus === 1 ? 'Heater ON' : 'Heater OFF',    icon: flameOutline,    active: battery.heaterStatus === 1 },
    { id: 'charger', label: isCharging ? 'Charger ON' : 'Charger OFF',                  icon: flashOutline,    active: isCharging },
  ], [battery.heaterStatus, hasNfc, isCharging, isConnected, isScanning]);

  return (
    <div className="control-panel">
      <h2 className="panel-title">Status</h2>
      <div className="control-button-list">
        {statusItems.map((item) => (
          <div
            key={item.id}
            className={`control-button ${item.active ? 'active' : ''} ${item.scanning ? 'scanning' : ''}`}
          >
            <IonIcon icon={item.icon} className="control-button-icon" />
            <span className="control-button-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
