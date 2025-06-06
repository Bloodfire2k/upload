# Visitenkarten Upload System

Dieses Projekt ist eine React-Anwendung zum Hochladen und Verarbeiten von Visitenkarten.

## Entwicklung

Im Projektverzeichnis können Sie folgende Befehle ausführen:

### `npm start`

Startet die App im Entwicklungsmodus.\
Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Erstellt die App für die Produktion im `build`-Ordner.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

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
