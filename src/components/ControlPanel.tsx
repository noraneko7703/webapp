import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  powerOutline,
  cardOutline,
  flameOutline,
  batteryChargingOutline,
  bluetoothOutline,
} from 'ionicons/icons';
import { ControlButton, OtaType, UploadProgress } from '../types/ble';
import { OtaPage } from '../pages/OtaPage';
import './ControlPanel.css';

interface ControlPanelProps {
  onPowerToggle: (active: boolean) => void;
  onHeaterToggle: (active: boolean) => void;
  isUploading: boolean;
  progress: UploadProgress;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
}

interface ButtonConfig {
  id: ControlButton;
  label: string;
  icon: string;
  toggleable: boolean;
}

const buttons: ButtonConfig[] = [
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
}) => {
  const [activeButtons, setActiveButtons] = useState<Set<ControlButton>>(new Set());
  const [otaExpanded, setOtaExpanded] = useState(false);

  const handleClick = (button: ButtonConfig) => {
    if (button.id === 'ota') {
      setOtaExpanded((prev) => !prev);
      return;
    }

    if (button.toggleable) {
      setActiveButtons((prev) => {
        const next = new Set(prev);
        const isActive = next.has(button.id);
        if (isActive) {
          next.delete(button.id);
        } else {
          next.add(button.id);
        }

        if (button.id === 'power') onPowerToggle(!isActive);
        if (button.id === 'heater') onHeaterToggle(!isActive);

        return next;
      });
    }
  };

  return (
    <div className="control-panel">
      <div className="control-button-list">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`control-button ${
              activeButtons.has(button.id) || (button.id === 'ota' && otaExpanded)
                ? 'active'
                : ''
            }`}
            onClick={() => handleClick(button)}
          >
            <IonIcon icon={button.icon} className="control-button-icon" />
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
