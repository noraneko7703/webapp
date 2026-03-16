import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { powerOutline, cloudDownloadOutline} from 'ionicons/icons';
import { OtaType, UploadProgress } from '../types/ble';
import { OtaPage } from '../pages/OtaPage';
import './PowerButtonPanel.css';

interface PowerButtonPanelProps {
  heaterStatus: number;
  onToggle: (active: boolean) => void;
  isConnected: boolean;
  isScanning: boolean;
  onScan: () => void;
  isUploading: boolean;
  progress: UploadProgress;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
}

export const PowerButtonPanel: React.FC<PowerButtonPanelProps> = ({
  heaterStatus,
  onToggle,
  isConnected,
  isScanning,
  onScan,
  isUploading,
  progress,
  onStartUpload,
}) => {
  const isOn = heaterStatus === 1;
  const [otaExpanded, setOtaExpanded] = useState(false);

  useEffect(() => {
    if (!isConnected && progress.percent !== 100) {
      setOtaExpanded(false);
    }
  }, [isConnected, progress.percent]);

  const handleBluetoothClick = () => {
    if (isConnected) {
      setOtaExpanded((prev) => !prev);
    } else {
      onScan();
    }
  };

  return (
    <div className="power-button-panel">
      <h2 className="power-panel-title">Control</h2>
      <button
        className={`bluetooth-action-button ${isConnected ? 'active' : ''}`}
        onClick={handleBluetoothClick}
      >
        <IonIcon icon={cloudDownloadOutline} className="power-toggle-icon" />
        <span className="power-toggle-label">
          {isScanning ? 'Scanning...' : isConnected ? 'Firmware OTA' : 'SCAN Bluetooth'}
        </span>
      </button>

      <div className="power-toggle-list">
        <div className={`power-toggle-row ${isOn ? 'active' : ''}`}>
          <IonIcon icon={powerOutline} className="power-toggle-icon" />
          <span className="power-toggle-label">
            {isOn ? 'Power ON' : 'Power OFF'}
          </span>
          <div
            className={`power-toggle ${isOn ? 'active' : ''}`}
            onClick={() => onToggle(!isOn)}
          >
            <div className="power-toggle-knob" />
          </div>
        </div>
      </div>

      {otaExpanded && (
        <div className="ota-section">
          <OtaPage
            isUploading={isUploading}
            progress={progress}
            onStartUpload={onStartUpload}
          />
        </div>
      )}
    </div>
  );
};
