import { useCallback } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { ControlPanel } from './ControlPanel';
import { TemperaturePanel } from './TemperaturePanel';
import { BatteryPanel } from './BatteryPanel';
import { OtaType, UploadProgress } from '../types/ble';
import './Dashboard.css';

interface DashboardProps {
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
  isUploading: boolean;
  progress: UploadProgress;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartUpload,
  isUploading,
  progress,
}) => {
  const { data, startHeater, stopHeater } = useDashboardData();

  const handlePowerToggle = useCallback((active: boolean) => {
    console.log('Power:', active ? 'ON' : 'OFF');
  }, []);

  const handleHeaterToggle = useCallback(
    (active: boolean) => {
      if (active) {
        startHeater();
      } else {
        stopHeater();
      }
    },
    [startHeater, stopHeater]
  );

  return (
    <div className="dashboard-grid">
      <div className="dashboard-left">
        <ControlPanel
          onPowerToggle={handlePowerToggle}
          onHeaterToggle={handleHeaterToggle}
          isUploading={isUploading}
          progress={progress}
          onStartUpload={onStartUpload}
        />
      </div>
      <div className="dashboard-center">
        <TemperaturePanel
          temperature={data.temperature}
          elapsedTime={data.elapsedTime}
          targetTemperature={data.targetTemperature}
          temperatureHistory={data.temperatureHistory}
        />
      </div>
      <div className="dashboard-right">
        <BatteryPanel battery={data.battery} />
      </div>
    </div>
  );
};
