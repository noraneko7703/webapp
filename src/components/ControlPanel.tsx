import { useState, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import {
  powerOutline,
  cardOutline,
  flameOutline,
  batteryChargingOutline,
  bluetoothOutline,
} from 'ionicons/icons';
import { ControlButton, OtaType, UploadProgress, BatteryInfo } from '../types/ble';
import { OtaPage } from '../pages/OtaPage';
import './ControlPanel.css';

interface ControlPanelProps {
  onPowerToggle: (active: boolean) => void;
  onHeaterToggle: (active: boolean) => void;
  isUploading: boolean;
  progress: UploadProgress;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
  battery: BatteryInfo;
}

interface ButtonConfig {
  id: ControlButton;
  label: string;
  icon: any;
  toggleable: boolean;
}

interface ButtonState {
  power: boolean;
  nfc: boolean;
  heater: boolean;
  charger: boolean;
  ota: boolean;
}

const buttonConfigs: ButtonConfig[] = [
  { id: 'power', label: 'Power On', icon: powerOutline, toggleable: true },
  { id: 'nfc', label: 'NFC bottle time', icon: cardOutline, toggleable: false },
  { id: 'heater', label: 'Heater On', icon: flameOutline, toggleable: true },
  { id: 'charger', label: 'Charger On', icon: batteryChargingOutline, toggleable: true },
  { id: 'ota', label: 'Over-the-Air', icon: bluetoothOutline, toggleable: false },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onPowerToggle,
  onHeaterToggle,
  isUploading,
  progress,
  onStartUpload,
  battery,
}) => {
  const [buttonStates, setButtonStates] = useState<ButtonState>({
    power: battery.heaterStatus === 1,
    nfc: false,
    heater: battery.heaterStatus === 1,
    charger: false,
    ota: false,
  });
  const [otaExpanded, setOtaExpanded] = useState(false);

  // 同步 BLE 加热状态到按钮状态
  const heaterStateList = useMemo(() => {
    return {
      ...buttonStates,
      power: battery.heaterStatus === 1,
      heater: battery.heaterStatus === 1,
    };
  }, [battery.heaterStatus, buttonStates]);

  const handleButtonClick = (id: ControlButton) => {
    if (id === 'ota') {
      setOtaExpanded((prev) => !prev);
      return;
    }

    setButtonStates((prev) => {
      const updated = { ...prev, [id]: !prev[id] };

      if (id === 'power') onPowerToggle(!prev.power);
      if (id === 'heater') onHeaterToggle(!prev.heater);

      return updated;
    });
  };

  return (
    <div className="control-panel">
      <div className="control-button-list">
        {buttonConfigs.map((button) => (
          <button
            key={button.id} //
            className={`control-button ${
              (button.id === 'power' || button.id === 'heater'
                ? heaterStateList[button.id]
                : buttonStates[button.id]) ||
              (button.id === 'ota' && otaExpanded)
                ? 'active'
                : ''
            }`}
            onClick={() => handleButtonClick(button.id)}
            disabled={button.id === 'power' || button.id === 'heater'}
          >
            <IonIcon icon={button.icon} className="control-button-icon"></IonIcon>
            <span className="control-button-label">{button.label}</span>
          </button>
        ))}
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
