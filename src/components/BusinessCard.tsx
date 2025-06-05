import React, { useState, useRef, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { CameraAlt as CameraIcon, Upload as UploadIcon, Send as SendIcon } from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import { config } from '../config';

interface BusinessCardProps {
  processedImage: string | null;
  setProcessedImage: (image: string | null) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ processedImage, setProcessedImage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string>('unbekannt');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Überprüfe Server-Erreichbarkeit
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log('Teste Verbindung zu:', config.paperlessUrl);
        
        // Teste verschiedene mögliche Endpunkte
        const testUrls = [
          `${config.paperlessUrl}/api/`,
          `${config.paperlessUrl}/paperless/api/`,
          `${config.paperlessUrl}/api/documents/`,
          `${config.paperlessUrl}/paperless/api/documents/`
        ];

        console.log('Teste folgende URLs:', testUrls);

        for (const url of testUrls) {
          try {
            console.log('Teste URL:', url);
            const response = await axios.get(url, {
              timeout: 5000
            });
            console.log('Erfolgreiche Antwort von:', url, response.status);
            setServerStatus('verbunden');
            // Speichere die erfolgreiche Basis-URL
            if (url.includes('/paperless/')) {
              console.log('Paperless wurde in einem Unterverzeichnis gefunden');
              // Aktualisiere die URL in der Konfiguration
              config.paperlessUrl = config.paperlessUrl + '/paperless';
            }
            return;
          } catch (err: any) {
            console.log('Fehler bei URL', url, ':', err.message);
            if (err.response) {
              // Wenn wir eine Antwort bekommen, auch wenn es ein Fehler ist,
              // bedeutet das, der Server ist erreichbar
              console.log('Server antwortet, aber mit Fehler:', err.response.status);
              setServerStatus('erreichbar, aber nicht autorisiert');
              return;
            }
          }
        }
        
        // Wenn keine URL erfolgreich war
        throw new Error('Keine der getesteten URLs war erfolgreich');
      } catch (err: any) {
        console.error('Server-Test fehlgeschlagen:', err);
        setServerStatus('nicht erreichbar');
        setError(`Server nicht erreichbar. Bitte überprüfen Sie:
1. Ist die URL korrekt? (${config.paperlessUrl})
2. Läuft der Paperless-ngx Server?
3. Ist der Server von außen erreichbar?
4. Fehler: ${err.message}`);
      }
    };
    checkServer();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Kamera konnte nicht gestartet werden.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setIsLoading(true);
    try {
      // Erstelle ein temporäres Bild-Element
      const img = new Image();
      img.src = imageData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Erstelle einen neuen Canvas mit den Bildabmessungen
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Zeichne das Bild auf den Canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // Explizit als JPEG mit hoher Qualität speichern
        const processedImageData = canvas.toDataURL('image/jpeg', 1.0);
        setProcessedImage(processedImageData);
      }
    } catch (err) {
      setError('Fehler bei der Bildverarbeitung');
      console.error('Bildverarbeitungsfehler:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToPaperless = async () => {
    if (!processedImage) return;
    if (!config.paperlessToken) {
      setError('Kein API-Token konfiguriert. Bitte fügen Sie den Token in der .env.local Datei hinzu.');
      return;
    }

    try {
      setIsLoading(true);

      // Lade das Bild zuerst in ein Image-Element
      const img = new Image();
      img.src = processedImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Erstelle einen Canvas mit den Bildabmessungen
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Zeichne das Bild auf den Canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas-Kontext konnte nicht erstellt werden');
      
      ctx.drawImage(img, 0, 0);
      
      // Konvertiere zu Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 1.0);
      });

      // Konvertiere Blob zu ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      const imageBytes = new Uint8Array(arrayBuffer);

      // PDF erstellen
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      
      // Bild in PDF einfügen
      const image = await pdfDoc.embedJpg(imageBytes);
      const { width, height } = page.getSize();
      
      // Seitenverhältnis beibehalten
      const scale = Math.min(width / image.width, height / image.height);
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      
      // Bild zentrieren
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;
      
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      const pdfBytes = await pdfDoc.save();
      
      // An Paperless-ngx senden
      const formData = new FormData();
      formData.append('document', new Blob([pdfBytes], { type: 'application/pdf' }), 'visitenkarte.pdf');
      
      const apiUrl = `${config.paperlessUrl}/api/documents/upload/`;
      console.log('Sende an:', apiUrl);
      console.log('Mit Token:', config.paperlessToken ? 'Token vorhanden' : 'Kein Token!');
      
      try {
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Authorization': `Token ${config.paperlessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
        console.log('Antwort von Paperless:', response.data);
        setProcessedImage(null);
      } catch (apiError: any) {
        console.error('API Fehler Details:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          config: {
            url: apiError.config?.url,
            method: apiError.config?.method,
          }
        });
        
        let errorMessage = 'Fehler beim Senden an Paperless-ngx';
        if (apiError.message === 'Network Error') {
          errorMessage = `Verbindungsfehler: Server-Status ist "${serverStatus}". Bitte überprüfen Sie die URL und Ihre Internetverbindung.`;
        } else if (apiError.response?.status === 401) {
          errorMessage = 'Authentifizierungsfehler: Bitte überprüfen Sie Ihren API-Token';
        } else if (apiError.response?.status === 403) {
          errorMessage = 'Zugriff verweigert: Keine ausreichenden Berechtigungen';
        } else if (apiError.response?.data?.detail) {
          errorMessage = `Server-Fehler: ${apiError.response.data.detail}`;
        }
        
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Allgemeiner Fehler:', err);
      setError(`Fehler beim Verarbeiten: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Visitenkarten Scanner
      </Typography>

      <Typography color="textSecondary" gutterBottom>
        Server-Status: {serverStatus}
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <Box sx={{ my: 2 }}>
        <video
          ref={videoRef}
          style={{ display: processedImage ? 'none' : 'block', maxWidth: '100%', margin: '0 auto' }}
          autoPlay
          playsInline
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {processedImage && (
          <img 
            src={processedImage} 
            alt="Gescannte Visitenkarte" 
            style={{ maxWidth: '100%', margin: '0 auto' }} 
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
        {!processedImage ? (
          <>
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={startCamera}
              disabled={isLoading}
            >
              Kamera
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Upload
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {videoRef.current && (
              <Button
                variant="contained"
                color="primary"
                onClick={captureImage}
                disabled={isLoading}
              >
                Foto aufnehmen
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={sendToPaperless}
            disabled={isLoading}
          >
            An Paperless senden
          </Button>
        )}
      </Box>

      {isLoading && (
        <CircularProgress sx={{ mt: 2 }} />
      )}
    </Box>
  );
}; 