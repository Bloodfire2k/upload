// Wenn die App auf dem gleichen Server läuft, verwenden wir relative URLs
const isProduction = process.env.NODE_ENV === 'production';
const defaultUrl = isProduction ? '' : 'http://localhost:8000';

export const config = {
  // Entferne trailing slashes und normalisiere die URL
  paperlessUrl: (process.env.REACT_APP_PAPERLESS_URL || defaultUrl).replace(/\/+$/, ''),
  paperlessToken: process.env.REACT_APP_PAPERLESS_TOKEN || '',
};

// Überprüfe die Konfiguration beim Start
console.log('Environment:', process.env.NODE_ENV);
console.log('Paperless URL:', config.paperlessUrl);
console.log('Token vorhanden:', !!config.paperlessToken); 