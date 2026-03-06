import { useState, useMemo, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  powerOutline,
  cardOutline,
  flameOutline,
  flashOutline,
  bluetoothOutline,
} from 'ionicons/icons';
import { OtaType, UploadProgress, BatteryInfo } from '../types/ble';
import { OtaPage } from '../pages/OtaPage';
import './ControlPanel.css';

interface ControlPanelProps {
  isUploading: boolean;
  progress: UploadProgress;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
  battery: BatteryInfo;
  isConnected: boolean;
  isScanning: boolean;
  onScan: () => void;
}

interface StatusItem {
  id: string;
  label: string;
  icon: any;
  active: boolean;
  scanning?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isUploading,
  progress,
  onStartUpload,
  battery,
  isConnected,
  isScanning,
  onScan,
}) => {
  const [otaExpanded, setOtaExpanded] = useState(false);

  // 斷線時自動關閉 OTA 面板（OTA 完成後斷線除外，讓倒數計時跑完）
  useEffect(() => {
    if (!isConnected && progress.percent !== 100) {
      setOtaExpanded(false);
    }
  }, [isConnected, progress.percent]);

  const isCharging = battery.averageCurrent > 0;
  const hasNfc = battery.nfcUid.length > 0 && !/^0+$/.test(battery.nfcUid);

  const statusItems = useMemo<StatusItem[]>(() => [
    { id: 'power',   label: battery.heaterStatus === 1 ? 'Power ON'   : 'Power OFF',   icon: powerOutline,          active: battery.heaterStatus === 1 },
    { id: 'nfc',     label: hasNfc ? 'NFC ON' : 'NFC OFF',                              icon: cardOutline,            active: hasNfc },
    { id: 'heater',  label: battery.heaterStatus === 1 ? 'Heater ON'  : 'Heater OFF',  icon: flameOutline,           active: battery.heaterStatus === 1 },
    { id: 'charger', label: isCharging ? 'Charger ON' : 'Charger OFF',                 icon: flashOutline,           active: isCharging },
    { id: 'ota',     label: isScanning ? 'Scanning...' : isConnected ? 'Bluetooth ON' : 'Bluetooth OFF', icon: bluetoothOutline, active: isConnected, scanning: isScanning },
  ], [battery.heaterStatus, hasNfc, isCharging, isConnected, isScanning]);

  const handleBluetoothClick = () => {
    if (isConnected) {
      setOtaExpanded((prev) => !prev);
    } else {
      onScan();
    }
  };

  return (
    <div className="control-panel">
      <h2 className="panel-title">Status</h2>
      {/* 純顯示狀態列 */}
      <div className="control-button-list">
        {statusItems.map((item) => (
          <div
            key={item.id}
            className={`control-button ${item.active ? 'active' : ''} ${item.scanning ? 'scanning' : ''}`}
          >
            <IonIcon icon={item.icon} className="control-button-icon" />
            <span className="control-button-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bluetooth 動作按鈕 */}
      <button
        className={`bluetooth-action-button ${isConnected ? 'active' : ''}`}
        onClick={handleBluetoothClick}
      >
        <IonIcon icon={bluetoothOutline} className="control-button-icon" />
        <span className="control-button-label">
          {isConnected ? 'Firmware OTA ' : 'SCAN Bluetooth'}
        </span>
      </button>

      {/* OTA 面板（連線後展開） */}
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
