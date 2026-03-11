import { StatusPanel } from './StatusPanel';
import { PowerButtonPanel } from './PowerButtonPanel';
import { TemperaturePanel } from './TemperaturePanel';
import { BatteryPanel } from './BatteryPanel';
import { NfcPanel } from './NfcPanel';
import { OtaType, UploadProgress, DashboardData } from '../types/ble';
import './Dashboard.css';

interface DashboardProps {
  data: DashboardData;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
  isUploading: boolean;
  progress: UploadProgress;
  onHeaterToggle: (active: boolean) => void;
  isConnected: boolean;
  isScanning: boolean;
  onScan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onStartUpload,
  isUploading,
  progress,
  onHeaterToggle,
  isConnected,
  isScanning,
  onScan,
}) => {
  return (
    <div className="dashboard-grid">
      <div className="dashboard-left">
        <PowerButtonPanel
          heaterStatus={data.battery.heaterStatus}
          onToggle={onHeaterToggle}
          isConnected={isConnected}
          isScanning={isScanning}
          onScan={onScan}
          isUploading={isUploading}
          progress={progress}
          onStartUpload={onStartUpload}
        />
        <StatusPanel
          battery={data.battery}
          isConnected={isConnected}
          isScanning={isScanning}
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
        <NfcPanel nfcUid={data.battery.nfcUid} />
      </div>
    </div>
  );
};
