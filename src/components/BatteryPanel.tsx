import { IonIcon } from '@ionic/react';
import {
  batteryHalfOutline,
  batteryChargingOutline,
  thermometerOutline,
  removeOutline,
  pulseOutline,
} from 'ionicons/icons';
import { PieChart, Pie } from 'recharts';
import { BatteryInfo } from '../types/ble';
import './BatteryPanel.css';

interface BatteryPanelProps {
  battery: BatteryInfo;
}

interface BatteryRow {
  icon: string;
  label: string;
  value: string;
  color: string;
  valueColor?: string;
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


const DONUT_SIZE = 200;

export const BatteryPanel: React.FC<BatteryPanelProps> = ({ battery }) => {
  const currentStatus = getCurrentStatus(battery.averageCurrent);
  const isCharging = battery.averageCurrent > 0;

  // Donut arc 顏色反映充電狀態：充電/閒置=綠，放電=紅
  const arcColor = battery.averageCurrent < 0 ? '#ff3b30' : '#34c759';

  const socData = [
    { value: battery.stateOfCharge, fill: arcColor },
    { value: 100 - battery.stateOfCharge, fill: '#e5e5ea' },
  ];

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
      value: `${Math.abs(battery.averageCurrent)} mA`,
      color: currentStatus.color,
      valueColor: battery.averageCurrent !== 0 ? currentStatus.color : undefined,
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
      <div className="battery-title-row">
        <span className="battery-title">Battery Info</span>
        <span className="battery-subtitle">Li-ion 2830mAh/10.89Wh</span>
      </div>

      <div className="battery-soc-card">
        <div className={`battery-soc-chart-wrapper${isCharging ? ' is-charging' : ''}`}>
          <PieChart width={DONUT_SIZE} height={DONUT_SIZE}>
            <Pie
              data={socData}
              cx={DONUT_SIZE / 2 - 1}
              cy={DONUT_SIZE / 2 - 1}
              innerRadius={68}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            />
          </PieChart>
          <div className="battery-soc-overlay">
            <span className="battery-soc-value" style={{ color: arcColor }}>
              {battery.stateOfCharge}
            </span>
            <span className="battery-soc-unit">%</span>
          </div>
        </div>
        <span className="battery-soc-status" style={{ color: currentStatus.color }}>
          {currentStatus.sublabel}
        </span>
      </div>

      <div className="battery-rows">
        {rows.map((row, index) => (
          <div key={index} className="battery-row">
            <IonIcon icon={row.icon} style={{ fontSize: '40px', color: row.color }} />
            <div className="battery-row-text">
              <span className="battery-row-label">{row.label}</span>
            </div>
            <span className="battery-row-value" style={row.valueColor ? { color: row.valueColor } : undefined}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
