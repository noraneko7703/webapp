import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
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

function YAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }) {
  const val = payload?.value ?? 0;
  const is110 = val === 110;
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill={is110 ? '#ff3b30' : 'var(--chart-axis, #aeaeb2)'}
      fontWeight={is110 ? 700 : 400}
      fontSize={is110 ? 30 : 25}
    >
      {val}°
    </text>
  );
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
  const maxX = Math.max(12, temperatureHistory.length > 0 ? temperatureHistory.length - 1 : 0);

  const chartData = temperatureHistory.length > 0
    ? temperatureHistory.map((d, i) => ({
        index: i,
        temperature: Math.round(d.temperature * 10) / 10,
      }))
    : [{ index: 0, temperature: 0 }, { index: maxX, temperature: 0 }];

  return (
    <div className="temperature-panel">
      <h2 className="panel-title">Temperature</h2>
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
          <AreaChart data={chartData} margin={{ top: 50, right: 50, left: 50, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e5ea)" />
            <XAxis
              dataKey="index"
              type="number"
              domain={[0, maxX]}
              tick={{ fontSize: 25, fill: 'var(--chart-axis, #aeaeb2)' }}
              stroke="var(--chart-axis, #aeaeb2)"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 160]}
              ticks={[0, 40, 80, 110, 120, 160]}
              tick={<YAxisTick />}
              minTickGap={-1}
              stroke="var(--chart-axis, #aeaeb2)"
              axisLine={false}
              tickLine={false}
              unit="°"
            />
            <Tooltip
              formatter={(value: number | undefined) => [`${value ?? '--'} °C`, 'temperature']}
              contentStyle={{
                background: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                fontSize: '20px',
              }}
            />
            <ReferenceLine
              y={110}
              stroke="#ff3b30"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#ff9500"
              strokeWidth={2.5}
              fill="rgba(255, 149, 0, 0.12)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
