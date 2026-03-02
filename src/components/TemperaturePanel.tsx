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

function getTempColor(temp: number): string {
  if (temp >= 120) return '#ff3b30';
  if (temp >= 80) return '#ff9500';
  return '#1c1c1e';
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
      <div className="temp-hero">
        <div className="temp-card">
          <div className="temp-main">
            <span className="temp-value" style={{ color: getTempColor(temperature) }}>
              {Math.round(temperature)}
            </span>
            <span className="temp-unit">&deg;C</span>
          </div>
        </div>
        <div className="temp-card">
          <div className="temp-timer">{formatTime(elapsedTime)}</div>
        </div>
      </div>
      <div className="temp-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e5ea)" />
            <XAxis
              dataKey="index"
              tick={{ fontSize: 12, fill: 'var(--chart-axis, #aeaeb2)' }}
              stroke="var(--chart-axis, #aeaeb2)"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 160]}
              tick={{ fontSize: 12, fill: 'var(--chart-axis, #aeaeb2)' }}
              stroke="var(--chart-axis, #aeaeb2)"
              axisLine={false}
              tickLine={false}
              unit="°"
            />
            <Tooltip
              formatter={(value: number | undefined) => [`${value ?? '--'} °C`, '溫度']}
              contentStyle={{
                background: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                fontSize: '13px',
              }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ff3b30"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
