# Visitenkarten Upload System

Dieses Projekt ist eine Express.js-Anwendung zum Hochladen von Visitenkarten zu Paperless-ngx.

## Features

- Einfache HTML/JS Frontend-Seite mit Drag & Drop
- Express.js Backend mit PDF-Konvertierung
- Automatische Konvertierung von Bildern zu PDF
- Unterstützung für verschiedene Bildformate (JPG, PNG, HEIC, HEIF, WEBP)
- Direkte Integration mit Paperless-ngx

## Installation

```bash
# Repository klonen
git clone https://github.com/Bloodfire2k/upload.git
cd upload

# Abhängigkeiten installieren
npm install
```

## Konfiguration

Erstellen Sie eine `.env` oder `.env.local` Datei mit folgenden Variablen:

```env
PAPERLESS_URL=https://ihre-paperless-instanz.de
PAPERLESS_TOKEN=ihr-paperless-token
```

## Entwicklung

```bash
# Entwicklungsserver starten
npm start
```

Die Anwendung ist dann verfügbar unter: http://localhost:3000

## Unterstützte Dateiformate

- JPG/JPEG
- PNG
- HEIC
- HEIF
- WEBP
- PDF

## Technische Details

- Express.js Backend
- Sharp für Bildverarbeitung
- PDF-lib für PDF-Konvertierung
- Multer für Datei-Uploads
- Axios für HTTP-Requests

## Fehlerbehandlung

Die Anwendung bietet detailliertes Logging und Fehlerbehandlung:
- Validierung der Dateitypen
- Überprüfung der Paperless-ngx Verbindung
- Detaillierte Fehlermeldungen im Frontend
- Automatische Bereinigung temporärer Dateien

## Docker Deployment

Das Projekt enthält eine Docker-Konfiguration für einfaches Deployment.

### Lokales Testing

```bash
# Build und Start mit docker-compose
docker-compose up --build

# Die Anwendung ist dann verfügbar unter:
http://localhost:3005/scan/
```

### Deployment auf Coolify

1. Pushen Sie das Repository auf GitHub
2. In Coolify:
   - Wählen Sie "Create New Service" -> "Application"
   - Verbinden Sie Ihr GitHub Repository
   - Wählen Sie den Branch für das Deployment
   - Build-Konfiguration:
     - Build Command: `npm run build`
     - Start Command: Leer lassen (wird durch Dockerfile gesteuert)
     - Port: 3005
   - Deployment starten

## Technische Details

- Die Anwendung läuft unter dem Pfad `/scan/`
- Der Server läuft auf Port 3005
- nginx wird als Webserver verwendet
- Alle statischen Assets werden für 7 Tage gecached
- CORS ist für alle Ursprünge aktiviert

## Umgebungsvariablen

Keine speziellen Umgebungsvariablen erforderlich.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
