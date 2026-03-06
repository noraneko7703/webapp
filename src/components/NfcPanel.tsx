import { IonIcon } from '@ionic/react';
import { cardOutline } from 'ionicons/icons';
import './NfcPanel.css';

interface NfcPanelProps {
  nfcUid: string;
}

function formatUid(uid: string): string {
  if (!uid || /^0+$/.test(uid)) return '—';
  // Insert space every 2 chars: "E00208036D81D6AD" → "E0 02 08 03 6D 81 D6 AD"
  return uid.match(/.{1,2}/g)?.join(' ') ?? uid;
}

export const NfcPanel: React.FC<NfcPanelProps> = ({ nfcUid }) => {
  const hasTag = nfcUid.length > 0 && !/^0+$/.test(nfcUid);

  return (
    <div className="nfc-panel">
      <div className="nfc-title-row">
        <span className="nfc-title">NFC</span>
        <span className="battery-subtitle">ISO15693 UID </span>
      </div>

      <div className="nfc-uid-card">
        <span className={`nfc-uid-value${hasTag ? ' has-tag' : ''}`}>
          {formatUid(nfcUid)}
        </span>
      </div>
    </div>
  );
};
