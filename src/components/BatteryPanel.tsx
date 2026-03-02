import { IonIcon } from '@ionic/react';
import {
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
}

function getCurrentStatus(averageCurrent: number) {
  if (averageCurrent > 0) {
    return { icon: batteryChargingOutline, color: '#34c759', sublabel: 'Charging' };
  }
  if (averageCurrent < 0) {
    return { icon: batteryHalfOutline, color: '#ff3b30', sublabel: 'Discharging' };
  }
  return { icon: removeOutline, color: '#aeaeb2', sublabel: 'Idle' };
}

function getSocColor(soc: number): string {
  if (soc <= 20) return '#ff3b30';
  if (soc <= 40) return '#ff9500';
  return '#34c759';
}

export const BatteryPanel: React.FC<BatteryPanelProps> = ({ battery }) => {
  const currentStatus = getCurrentStatus(battery.averageCurrent);

  const rows: BatteryRow[] = [
    {
      icon: pulseOutline,
      label: 'Voltage',
      value: `${battery.voltage} mV`,
      color: '#ff9500',
    },
    {
      icon: currentStatus.icon,
      label: 'Current',
      sublabel: currentStatus.sublabel,
      value: `${Math.abs(battery.averageCurrent)} mA`,
      color: currentStatus.color,
    },
    {
      icon: thermometerOutline,
      label: 'Temp',
      value: `${battery.batteryTemp} °C`,
      color: '#ff3b30',
    },
  ];

  return (
    <div className="battery-panel">
      <div className="battery-panel-header">
        <div className="battery-header-left">
          <IonIcon icon={batteryHalfOutline} className="battery-header-icon" />
          <div className="battery-header-text">
            <span className="battery-header-title">Battery</span>
            <span className="battery-header-sub">Impedance Track</span>
          </div>
        </div>
        <div className="battery-soc">
          <span className="battery-soc-value" style={{ color: getSocColor(battery.stateOfCharge) }}>{battery.stateOfCharge}</span>
          <span className="battery-soc-unit">%</span>
        </div>
      </div>
      <div className="battery-rows">
        {rows.map((row, index) => (
          <div key={index} className="battery-row">
            <IonIcon icon={row.icon} style={{ fontSize: '40px', color: row.color }} />
            <div className="battery-row-text">
              <span className="battery-row-label">
                {row.label}
                {row.sublabel && <span className="battery-row-sublabel"> · {row.sublabel}</span>}
              </span>
            </div>
            <span className="battery-row-value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
