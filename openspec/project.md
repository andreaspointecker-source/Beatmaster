# BeatMaster - Projekt-Kontext

## Projekt-Übersicht

**Name:** BeatMaster
**Typ:** Progressive Web App (PWA)
**Zweck:** Party-Musikquiz-Spiel für Teams
**Version:** 1.0.0 (MVP in Entwicklung)

## Projektbeschreibung

BeatMaster ist eine installierbare Web-Anwendung, bei der Teams gegeneinander antreten, um Songs zu identifizieren und Musik-Trivia-Fragen zu beantworten. Spieler hören Song-Ausschnitte von YouTube und beantworten Fragen zu Titel, Interpret, Erscheinungsjahr, Genre und Dekade.

### Kernfunktionen
- **Song-Datenbank:** CRUD-Verwaltung einer lokalen Song-Sammlung
- **Team-Modus:** 1-10 Teams spielen gleichzeitig
- **Frage-Typen:** Song-Titel, Interpret, Jahr, Genre, Dekade
- **Punktesystem:** Basispunkte + Zeitbonus + Streak-Bonus
- **Musik-Wiedergabe:** YouTube IFrame API Integration
- **PWA:** Installierbar auf iOS/Android, Offline-fähige UI
- **Historie:** Tracking vergangener Spiele und Statistiken

## Tech-Stack

### Frontend
- **Framework:** Vanilla JavaScript (ES6+) - KEIN Framework
- **UI-Paradigma:** Single Page Application (SPA) mit Hash-basiertem Routing
- **Styling:** CSS3 mit Custom Properties (CSS Variables)
- **Design:** Mobile-First, Responsive Design
- **Farbschema:** Blau/Grün-Töne (Cyan #00D9FF, Petrol-Blau #0A4D68, Grün #05C46B)

### State Management & Persistence
- **State:** Observable Pattern mit zentralem State Store
- **Storage:** LocalStorage für Songs, Einstellungen, Historie
- **Session:** SessionStorage für aktiven Spielzustand

### Externe APIs
- **Musik-Quelle:** YouTube IFrame API
- **Offline:** Service Worker mit Cache-First-Strategie

### Build & Deployment
- **Build:** Keine Build-Pipeline (Vanilla JS)
- **Development Server:** Python HTTP Server oder ähnlich
- **Production:** Nginx auf Unraid-Server (Docker Container)

## Architektur-Patterns

### SPA-Routing
```javascript
// Hash-basiertes Routing: #/home, #/database, #/game-setup
App.navigate('database'); // Navigiert zu /#database
```

### Observable State
```javascript
// Zentraler State mit Observer-Pattern
State.set('songs', updatedSongs); // Triggert automatisch Subscriber
State.subscribe('songs', (newSongs) => { /* UI Update */ });
```

### Screen-Controller
```javascript
// Jeder Screen ist eine Klasse mit render() und destroy()
class DatabaseScreen {
  render(container, params) { /* Rendert UI */ }
  destroy() { /* Cleanup */ }
}
```

## Datei-Organisation

```
BeatMaster/
├── index.html              # Einstiegspunkt
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker
├── css/                    # Stylesheets
│   ├── main.css           # Variablen, Reset, Globals
│   ├── components.css     # Wiederverwendbare UI-Komponenten
│   ├── screens.css        # Screen-spezifische Layouts
│   └── responsive.css     # Media Queries
├── js/
│   ├── app.js            # App-Initialisierung & Router
│   ├── state.js          # State Management
│   ├── config.js         # Konfigurationskonstanten
│   ├── modules/          # Kern-Module
│   │   ├── storage.js    # LocalStorage-Abstraktion
│   │   ├── database.js   # Song-CRUD
│   │   ├── youtube-player.js
│   │   ├── game-engine.js
│   │   ├── question-generator.js
│   │   ├── scoring.js
│   │   ├── timer.js
│   │   └── utils.js
│   └── screens/          # Screen-Controller
│       ├── home.js
│       ├── database-manager.js
│       ├── game-setup.js
│       ├── gameplay.js
│       ├── scoreboard.js
│       ├── results.js
│       ├── settings.js
│       └── history.js
├── data/
│   └── default-songs.json  # Beispiel-Songs
├── assets/
│   ├── icons/            # PWA Icons
│   ├── sounds/           # Soundeffekte
│   └── images/
├── docs/                 # Dokumentation
│   ├── implementation-plan.md
│   └── ui-design-spec.md
└── openspec/            # OpenSpec-Spezifikationen
```

## Coding-Konventionen

### JavaScript
- **Module-Pattern:** Globale Objekte (z.B. `const State = { ... }`)
- **Naming:** camelCase für Variablen/Funktionen, PascalCase für Klassen
- **Kommentare:** JSDoc für öffentliche Funktionen
- **Fehlerbehandlung:** Try-catch mit User-Feedback via `App.showNotification()`
- **Async:** Promises bevorzugen, async/await für YouTube API
- **Konstanten:** Zentralisiert in `CONFIG` (config.js)

### HTML
- **Semantic HTML:** `<main>`, `<section>`, `<article>` verwenden
- **Accessibility:** ARIA-Labels, Keyboard-Navigation, Focus-Management
- **Data-Attributes:** Für Event-Handler (z.B. `data-action="delete-song"`)
- **Templates:** String-Templates in Screen-Controllern

### CSS
- **Variablen:** Alle Farben, Spacing, Font-Größen in `:root`
- **BEM-ähnlich:** `.card`, `.card__header`, `.card--primary`
- **Mobile-First:** Base-Styles mobil, dann `@media (min-width: ...)`
- **Transitions:** Über CSS Custom Property `--transition-base`

### File Loading Order
```html
<!-- Wichtig: Reihenfolge muss eingehalten werden -->
1. config.js          (Konstanten)
2. utils.js           (Hilfsfunktionen)
3. state.js           (State Management)
4. modules/*.js       (Kern-Module)
5. screens/*.js       (Screen-Controller)
6. app.js             (Initialisierung - ZULETZT)
```

## Daten-Schemas

### Song-Objekt
```javascript
{
  id: "uuid-v4",
  title: "Bohemian Rhapsody",
  artist: "Queen",
  year: 1975,
  genre: "Rock",
  album: "A Night at the Opera",
  youtubeId: "fJ9rUzIMcZQ",
  startTime: 30,        // Optional: Start (Sekunden)
  duration: 20,         // Optional: Clip-Dauer
  difficulty: "medium", // easy, medium, hard
  tags: ["classic", "70s"],
  playCount: 0,
  lastPlayed: null,
  createdAt: "ISO-timestamp",
  updatedAt: "ISO-timestamp"
}
```

### Game State
```javascript
{
  gameId: "uuid",
  mode: "classic",           // classic, speed, marathon
  status: "playing",         // setup, playing, paused, completed
  currentRound: 1,
  totalRounds: 10,
  currentTeamIndex: 0,
  currentSongId: "uuid",
  currentQuestion: { /* ... */ },
  teams: [
    {
      id: "uuid",
      name: "Team Rockstars",
      color: "#FF6B6B",
      score: 450,
      roundScores: [100, 50, 0, 150],
      correctAnswers: 4,
      wrongAnswers: 1,
      streak: 2
    }
  ],
  playedSongs: ["id1", "id2"],
  playlist: ["id3", "id4"],
  settings: { /* ... */ }
}
```

## Testing-Strategie

### Manuelle Tests
- Browser: Chrome, Firefox, Safari (Desktop & Mobile)
- Devices: iOS Safari, Android Chrome
- Offline: Service Worker Cache-Verhalten

### Kritische Testfälle
- **Fuzzy Matching:** Song-Titel mit Tippfehlern
- **Timer-Genauigkeit:** Keine Drift über 10+ Runden
- **LocalStorage Quota:** Warnung bei 80% Kapazität
- **YouTube API:** Nicht verfügbare Videos, Autoplay auf iOS
- **State-Sync:** Updates propagieren zu allen Subscribern

## Deployment

### Development
```bash
python -m http.server 8888
# Zugriff: http://localhost:8888
```

### Production (Unraid)
```yaml
# Docker Compose
services:
  beatmaster:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - /mnt/user/appdata/beatmaster/www:/usr/share/nginx/html:ro
```

## Entwicklungs-Phasen

1. ✅ **Phase 1:** Fundament (State, Storage, Router, CSS)
2. 🔄 **Phase 2:** Song-Datenbank (CRUD, Import/Export)
3. ⏳ **Phase 3:** YouTube-Integration
4. ⏳ **Phase 4:** Game-Engine (Timer, Fragen, Scoring)
5. ⏳ **Phase 5:** Spiel-UI (Setup, Gameplay, Results)
6. ⏳ **Phase 6:** Polish (Settings, Historie, Animationen)
7. ⏳ **Phase 7:** PWA & Deployment (Icons, Service Worker, Unraid)

## Wichtige Prinzipien

1. **Keine Frameworks:** Vanilla JS für volle Kontrolle und minimale Komplexität
2. **Mobile-First:** Design und Test primär für Mobilgeräte
3. **Offline-First:** UI muss ohne Internet funktionieren (YouTube benötigt Internet)
4. **Progressive Enhancement:** Basis-Funktionalität überall, Extras wo unterstützt
5. **Accessibility:** Keyboard-Navigation, Screen-Reader, WCAG 2.1 AA
6. **Performance:** Unter 3s Ladezeit, 60 FPS Animationen
7. **Datenschutz:** Alle Daten lokal, keine Tracking-Scripts, keine externen Fonts

## Externe Ressourcen

- **Dokumentation:** `docs/implementation-plan.md`, `docs/ui-design-spec.md`
- **YouTube IFrame API:** https://developers.google.com/youtube/iframe_api_reference
- **PWA Best Practices:** https://web.dev/progressive-web-apps/
