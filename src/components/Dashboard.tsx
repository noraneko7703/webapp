import { useCallback } from 'react';
import { ControlPanel } from './ControlPanel';
import { TemperaturePanel } from './TemperaturePanel';
import { BatteryPanel } from './BatteryPanel';
import { OtaType, UploadProgress, DashboardData } from '../types/ble';
import './Dashboard.css';

interface DashboardProps {
  data: DashboardData;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
  isUploading: boolean;
  progress: UploadProgress;
  onHeaterToggle: (active: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onStartUpload,
  isUploading,
  progress,
  onHeaterToggle,
}) => {
  const handlePowerToggle = useCallback((active: boolean) => {
    console.log('Power:', active ? 'ON' : 'OFF');
  }, []);

  return (
    <div className="dashboard-grid">
      <div className="dashboard-left">
        <ControlPanel
          onPowerToggle={handlePowerToggle}
          onHeaterToggle={onHeaterToggle}
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
