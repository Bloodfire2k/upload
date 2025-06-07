import React, { useState, useRef } from 'react';
import { 
  Button, 
  Box, 
  Container, 
  Paper, 
  Typography,
  Stack,
  CircularProgress
} from '@mui/material';
import { CameraAlt, Send } from '@mui/icons-material';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';

interface BusinessCardImage {
  dataUrl: string;
  timestamp: Date;
}

export const BusinessCardScanner: React.FC = () => {
  const [images, setImages] = useState<BusinessCardImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 2560 },
          height: { ideal: 1440 },
          aspectRatio: { ideal: 1.7777777778 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Kamera:', error);
      alert('Konnte nicht auf die Kamera zugreifen. Bitte überprüfen Sie die Berechtigungen.');
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setImages(prev => [...prev, { dataUrl, timestamp: new Date() }]);
      }
    }
  };

  const sendToPaperless = async () => {
    if (images.length === 0) return;
    
    setIsLoading(true);
    const apiUrl = '/api/documents/post_document/';
    
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const image of images) {
        const jpgImage = await fetch(image.dataUrl)
          .then(res => res.arrayBuffer())
          .then(buffer => pdfDoc.embedJpg(buffer));
        
        const imgDims = jpgImage.scale(1);
        
        const page = pdfDoc.addPage([595.276, 841.890]);
        const { width, height } = page.getSize();
        
        const scale = Math.min(
          (width * 0.95) / imgDims.width,
          (height * 0.95) / imgDims.height
        );
        
        const scaledWidth = imgDims.width * scale;
        const scaledHeight = imgDims.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        
        page.drawImage(jpgImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
          opacity: 1,
        });
      }
      
      // PDF mit höherer Qualität erstellen
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });
      
      console.log('Sende an URL:', apiUrl);
      
      const formData = new FormData();
      formData.append('document', new Blob([pdfBytes], { type: 'application/pdf' }), 'visitenkarten.pdf');
      formData.append('title', `Visitenkarte ${new Date().toLocaleDateString()}`);
      formData.append('created', new Date().toISOString());
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${process.env.REACT_APP_PAPERLESS_TOKEN}`,
        },
      });
      
      console.log('Response:', response);
      
      if (response.data) {
        const taskId = response.data;
        console.log('Task ID:', taskId);
      }
      
      alert('Dokument erfolgreich an Paperless-ngx gesendet!');
      setImages([]);
    } catch (error) {
      console.error('Fehler beim Senden:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = `
Fehler beim Senden an Paperless:
URL: ${apiUrl}
Message: ${error.message}
Status: ${error.response?.status}
Details: ${JSON.stringify(error.response?.data, null, 2)}
`;
        console.error(errorMessage);
        alert(errorMessage);
      } else {
        alert(`Fehler beim Senden an Paperless: ${error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Visitenkarten Scanner
        </Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ width: '100%', position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', borderRadius: '4px' }}
            />
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={startCamera}
              fullWidth
            >
              Kamera starten
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={takePhoto}
              fullWidth
            >
              Foto aufnehmen
            </Button>
          </Stack>
        </Paper>

        {images.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aufgenommene Bilder ({images.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.dataUrl}
                  alt={`Visitenkarte ${idx + 1}`}
                  style={{ width: '100px', height: 'auto', objectFit: 'cover' }}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
              onClick={sendToPaperless}
              disabled={isLoading}
              fullWidth
              sx={{ mt: 2 }}
            >
              An Paperless senden
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
}; 