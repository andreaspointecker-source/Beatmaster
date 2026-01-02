# 🎵 BeatMaster - Musikquiz PWA

Das ultimative Party-Musikquiz als Progressive Web App!

## 🚀 Features

- **Musikquiz-Spiel**: Identifiziere Songs von YouTube
- **Team-Modus**: Spiele mit bis zu 10 Teams gleichzeitig
- **Verschiedene Fragetypen**: Song-Titel, Interpret, Jahr, Genre, Dekade
- **Song-Datenbank**: Verwalte deine eigene Song-Sammlung
- **PWA**: Installierbar auf Mobilgeräten
- **Offline-Fähig**: UI funktioniert offline (YouTube benötigt Internet)
- **Responsive**: Funktioniert auf Handy, Tablet und Desktop

## 📋 Entwicklungsstand

### ✅ Phase 1: Fundament (FERTIG)
- Komplette Dateistruktur
- State Management (Observable Pattern)
- LocalStorage-Abstraktion
- SPA-Router (Hash-basiert)
- CSS-Framework mit Dark Theme
- Utility-Funktionen
- Home-Screen

### 🔄 Phase 2: Song-Datenbank (In Planung)
- Song-Verwaltung (CRUD)
- Such- und Filterfunktionen
- JSON Import/Export
- YouTube-ID-Extraktion

### ⏳ Phase 3-7: Folgt in den nächsten Wochen

## 🛠️ Tech-Stack

- **Vanilla JavaScript** (ES6+) - Kein Framework
- **CSS Custom Properties** - Dark Theme
- **LocalStorage** - Daten-Persistierung
- **YouTube IFrame API** - Musikwiedergabe
- **Service Worker** - PWA & Offline-Support

## 📦 Installation (Entwicklung)

1. Repository klonen
2. Webserver starten (z.B. `python -m http.server 8080`)
3. Browser öffnen: `http://localhost:8080`

## 🐳 Deployment (Unraid)

```bash
# 1. Ordner erstellen
mkdir -p /mnt/user/appdata/beatmaster/www

# 2. Dateien kopieren
cp -r * /mnt/user/appdata/beatmaster/www/

# 3. Docker Container starten
docker run -d \
  --name beatmaster \
  -p 8080:80 \
  -v /mnt/user/appdata/beatmaster/www:/usr/share/nginx/html:ro \
  --restart unless-stopped \
  nginx:alpine

# 4. Zugriff
# http://unraid-ip:8080
```

## 📁 Projektstruktur

```
BeatMaster/
├── index.html           # Haupteinstiegspunkt
├── manifest.json        # PWA Manifest
├── css/                 # Stylesheets
├── js/
│   ├── app.js          # App-Initialisierung & Router
│   ├── state.js        # State Management
│   ├── config.js       # Konfiguration
│   ├── modules/        # Kern-Module
│   └── screens/        # Screen-Controller
├── data/               # Song-Datenbank
└── assets/             # Icons, Sounds, Bilder
```

## 🎮 Nutzung

1. **Songs hinzufügen**: Navigiere zur Song-Datenbank
2. **Spiel konfigurieren**: Wähle Spielmodus, Teams, Runden
3. **Spielen**: Beantworte Fragen zu den abgespielten Songs
4. **Gewinnen**: Team mit den meisten Punkten gewinnt!

## 🔧 Konfiguration

Alle Einstellungen in `js/config.js`:
- Spielmodi
- Fragentypen
- Punktevergabe
- UI-Einstellungen

## 📱 PWA Installation

### Android (Chrome):
1. App öffnen
2. Menü (⋮) → "App installieren"
3. App erscheint auf Homescreen

### iOS (Safari):
1. App öffnen
2. Teilen-Button
3. "Zum Home-Bildschirm"

## 🤝 Beitragen

Dies ist ein persönliches Projekt. Feedback und Ideen willkommen!

## 📄 Lizenz

MIT License - Freie Nutzung für private Zwecke

## 🎉 Credits

Entwickelt mit Claude Code und viel Liebe zur Musik!

---

**Version:** 1.0.0
**Status:** In Entwicklung (Phase 1 abgeschlossen)
**Letzte Aktualisierung:** 2026-01-01
