import { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
} from '@ionic/react';
import ProgressBar from '@ramonak/react-progress-bar';
import { OtaType, UploadProgress } from '../types/ble';

interface OtaPageProps {
  isUploading: boolean;
  progress: UploadProgress;
  onStartUpload: (otaType: OtaType, file: ArrayBuffer) => void;
}

export const OtaPage: React.FC<OtaPageProps> = ({
  isUploading,
  progress,
  onStartUpload,
}) => {
  const [otaType, setOtaType] = useState<OtaType>('undefined');
  const [otaFile, setOtaFile] = useState<ArrayBuffer | null>(null);
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const handleSelectionChange = (event: CustomEvent) => {
    setOtaType(event.detail.value as OtaType);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const sourceFile = event.target.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      setOtaFile(reader.result as ArrayBuffer);
      setIsFileLoaded(true);
    });

    reader.readAsArrayBuffer(sourceFile);
  };

  const handleStartClick = () => {
    if (otaFile && otaType !== 'undefined') {
      onStartUpload(otaType, otaFile);
      setIsFileLoaded(false);
    }
  };

  return (
    <IonCard>
      <IonCardContent>
        {!isUploading && (
          <IonGrid>
            <IonRow>
              <IonSegment value={otaType} onIonChange={handleSelectionChange}>
                <IonSegmentButton value="app">
                  <IonLabel>App</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="spiffs">
                  <IonLabel>SPIFFS</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonRow>
          </IonGrid>
        )}

        {(otaType !== 'undefined' || isUploading) && (
          <IonGrid>
            <IonRow className="ion-justify-content-center ion-align-items-center">
              <IonCol size="12" sizeMd="6" sizeLg="4">
                {!isUploading && <input type="file" onChange={handleFileChange} />}
              </IonCol>
            </IonRow>

            <IonRow className="ion-justify-content-center ion-align-items-center">
              {isUploading && <IonLabel>{progress.speed.toFixed(2)} kB/s</IonLabel>}
            </IonRow>

            <IonRow className="ion-justify-content-center ion-align-items-center">
              <IonCol>
                {isUploading && (
                  <ProgressBar
                    completed={progress.percent}
                    labelAlignment="center"
                    bgColor="#3880ff"
                  />
                )}
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                {isFileLoaded && !isUploading && (
                  <IonButton onClick={handleStartClick}>Start</IonButton>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonCardContent>
    </IonCard>
  );
};
