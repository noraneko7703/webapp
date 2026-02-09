import { IonIcon } from '@ionic/react';
import {
  flashOutline,
  batteryHalfOutline,
  thermometerOutline,
  speedometerOutline,
} from 'ionicons/icons';
import { BatteryInfo } from '../types/ble';
import './BatteryPanel.css';

interface BatteryPanelProps {
  battery: BatteryInfo;
}

interface BatteryRow {
  icon: string;
  label: string;
  sublabel?: string;
  value: string;
  color: string;
}

export const BatteryPanel: React.FC<BatteryPanelProps> = ({ battery }) => {
  const rows: BatteryRow[] = [
    {
      icon: flashOutline,
      label: 'Voltage',
      value: `${battery.voltage} mV`,
      color: '#ffc409',
    },
    {
      icon: speedometerOutline,
      label: 'Average Current',
      sublabel: '(Charge/discharge)',
      value: `${battery.averageCurrent} mA`,
      color: '#3dc2ff',
    },
    {
      icon: batteryHalfOutline,
      label: 'State of Charge',
      value: `${battery.stateOfCharge} %`,
      color: '#2dd36f',
    },
    {
      icon: thermometerOutline,
      label: 'Battery Temp',
      value: `${battery.batteryTemp} °C`,
      color: '#eb445a',
    },
  ];

  return (
    <div className="battery-panel">
      <div className="battery-panel-header">
        <IonIcon icon={batteryHalfOutline} className="battery-header-icon" />
        <div className="battery-header-text">
          <span className="battery-header-title">Battery info</span>
          <span className="battery-header-sub">Impedance Track</span>
        </div>
      </div>
      <div className="battery-rows">
        {rows.map((row, index) => (
          <div key={index} className="battery-row">
            <IonIcon icon={row.icon} style={{ fontSize: '32px', color: row.color }} />
            <div className="battery-row-text">
              <span className="battery-row-label">
                {row.label}
                {row.sublabel && <span className="battery-row-sublabel"> {row.sublabel}</span>}
              </span>
              <span className="battery-row-value">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
