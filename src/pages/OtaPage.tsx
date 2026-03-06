import { useEffect, useRef, useState } from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import { OtaType, UploadProgress } from '../types/ble';
import './OtaPage.css';

interface OtaPageProps {
  isUploading: boolean;
  progress: UploadProgress;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const OtaPage: React.FC<OtaPageProps> = ({
  isUploading,
  progress,
  onStartUpload,
}) => {
  const otaType: OtaType = 'app';
  const [otaFile, setOtaFile] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsUploading = useRef(false);

  useEffect(() => {
    if (prevIsUploading.current && !isUploading && progress.percent === 100) {
      setCountdown(10);
    }
    prevIsUploading.current = isUploading;
  }, [isUploading, progress.percent]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { window.location.reload(); return; }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const sourceFile = event.target.files[0];
    setFileName(sourceFile.name);
    setFileSize(sourceFile.size);

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setOtaFile(reader.result as ArrayBuffer);
    });
    reader.readAsArrayBuffer(sourceFile);
  };

  const handleStartClick = () => {
    if (otaFile) {
      onStartUpload(otaType, otaFile);
    }
  };

  return (
    <IonCard className="ota-card">
      <IonCardContent>
        {countdown !== null ? (
          <div className="ota-done-wrap">
            <div className="ota-done-icon">✅</div>
            <div className="ota-done-title">Update Complete</div>
            <div className="ota-done-countdown">Refreshing in {countdown}s</div>
          </div>
        ) : isUploading ? (
          <div className="ota-progress-wrap">
            <div className="ota-progress-header">
              <span className="ota-progress-label">Updating...</span>
              <span className="ota-progress-speed">{progress.speed.toFixed(1)} kB/s</span>
            </div>
            <div className="ota-progress-bar-track">
              <div
                className="ota-progress-bar-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="ota-progress-percent">{progress.percent}%</div>
          </div>
        ) : (
          <>
            {/* Hidden type selector — defaults to 'app'. Re-enable to expose SPIFFS:
            <IonSegment value={otaType} onIonChange={...}>
              <IonSegmentButton value="app"><IonLabel>App</IonLabel></IonSegmentButton>
              <IonSegmentButton value="spiffs"><IonLabel>SPIFFS</IonLabel></IonSegmentButton>
            </IonSegment>
            */}

            <input
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div
              className={`ota-drop-zone${otaFile ? ' has-file' : ''}`}
              onClick={() => inputRef.current?.click()}
            >
              <div className="ota-drop-icon">{otaFile ? '✅' : '📂'}</div>
              <p className="ota-drop-title">
                {otaFile ? 'Firmware Uploaded' : 'Select a Firmware File'}
              </p>
            </div>

            {otaFile && (
              <div className="ota-file-info">
                <span className="ota-file-icon">📄</span>
                <span className="ota-file-name">{fileName}</span>
                <span className="ota-file-size">{formatBytes(fileSize)}</span>
              </div>
            )}

            {otaFile && (
              <button className="ota-start-btn" onClick={handleStartClick}>
                Start
              </button>
            )}
          </>
        )}
      </IonCardContent>
    </IonCard>
  );
};
