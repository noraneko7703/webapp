import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TemperatureData } from '../types/ble';
import './TemperaturePanel.css';

interface TemperaturePanelProps {
  temperature: number;
  elapsedTime: number;
  targetTemperature: number;
  temperatureHistory: TemperatureData[];
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export const TemperaturePanel: React.FC<TemperaturePanelProps> = ({
  temperature,
  elapsedTime,
  temperatureHistory,
}) => {
  const chartData = temperatureHistory.map((d, i) => ({
    index: i,
    temperature: Math.round(d.temperature * 10) / 10,
  }));

  return (
    <div className="temperature-panel">
      <div className="temp-readouts">
        <div className="temp-display">
          <span className="temp-value">{Math.round(temperature)}</span>
          <span className="temp-unit">&deg;C</span>
        </div>
        <div className="temp-display">
          <span className="temp-value">{formatTime(elapsedTime)}</span>
        </div>
      </div>
      <div className="temp-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e0e0e0)" />
            <XAxis
              dataKey="index"
              tick={{ fontSize: 14 }}
              stroke="var(--chart-axis, #999)"
            />
            <YAxis
              domain={[0, 160]}
              tick={{ fontSize: 14 }}
              stroke="var(--chart-axis, #999)"
              unit="°C"
            />
            <Tooltip
              formatter={(value: number) => [`${value} °C`, 'Temperature']}
              contentStyle={{
                background: 'var(--ion-card-background, #fff)',
                border: '1px solid var(--ion-border-color, #e0e0e0)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#eb445a"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
