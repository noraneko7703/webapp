import { IonIcon } from '@ionic/react';
import {
  flashOutline,
  batteryHalfOutline,
  batteryChargingOutline,
  thermometerOutline,
  removeOutline,
  pulseOutline,
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
  statusClass?: string;
}

function getCurrentStatus(averageCurrent: number) {
  if (averageCurrent > 0) {
    return { icon: batteryChargingOutline, color: '#2dd36f', sublabel: 'Charging', status: 'charging' as const };
  }
  if (averageCurrent < 0) {
    return { icon: batteryHalfOutline, color: '#eb445a', sublabel: 'Discharging', status: 'discharging' as const };
  }
  return { icon: removeOutline, color: '#92949c', sublabel: 'Idle', status: 'idle' as const };
}

export const BatteryPanel: React.FC<BatteryPanelProps> = ({ battery }) => {
  const currentStatus = getCurrentStatus(battery.averageCurrent);

  const rows: BatteryRow[] = [
    {
      icon: pulseOutline,
      label: 'Voltage',
      value: `${battery.voltage} mV`,
      color: '#ffc409',
    },
    {
      icon: currentStatus.icon,
      label: 'Average Current',
      sublabel: currentStatus.sublabel,
      value: `${Math.abs(battery.averageCurrent)} mA`,
      color: currentStatus.color,
      statusClass: `battery-row--${currentStatus.status}`,
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
          <div key={index} className={`battery-row ${row.statusClass ?? ''}`}>
            <IonIcon icon={row.icon} style={{ fontSize: '32px', color: row.color }} />
            <div className="battery-row-text">
              <span className="battery-row-label">
                {row.label}
                {row.sublabel && <span className="battery-row-sublabel"> {row.sublabel}</span>}
              </span>
              <span
                className="battery-row-value"
                style={row.statusClass ? { color: row.color } : undefined}
              >
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
