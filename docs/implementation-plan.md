# BeatMaster - Implementierungsplan

## Projekt-Übersicht

BeatMaster ist eine Party-Musikquiz Progressive Web App, bei der Teams gegeneinander antreten, um Songs zu identifizieren und Musik-Trivia zu beantworten. Spieler hören Song-Ausschnitte von YouTube und müssen Fragen zu Titel, Interpret, Jahr, Genre und mehr beantworten.

**Plattform:** PWA (installierbare Web-App) gehostet auf deinem Unraid-Server
**Tech-Stack:** Vanilla HTML/CSS/JavaScript (kein Framework)
**Musik-Quelle:** YouTube IFrame API
**Zeitplan:** 5-7 Wochen bis MVP

---

## Architektur-Zusammenfassung

### Anwendungstyp
**Single Page Application (SPA)** mit Hash-basiertem Routing (`#/home`, `#/game/play`, etc.)

**Warum SPA:**
- Besseres State-Management über Screens hinweg
- Flüssigere Übergänge und bessere UX
- Funktioniert perfekt mit PWA-Offline-Funktionen
- Kein serverseitiges Routing nötig

### Zentrale technische Entscheidungen

1. **State Management:** Observable Pattern mit zentralem State Store ([state.js](js/state.js))
2. **Speicherung:** LocalStorage für Songs, Einstellungen und Historie ([storage.js](js/modules/storage.js))
3. **Musik-Wiedergabe:** YouTube IFrame API mit Promise-basiertem Wrapper ([youtube-player.js](js/modules/youtube-player.js))
4. **Navigation:** Hash-basierter SPA-Router in [app.js](js/app.js)
5. **Styling:** CSS Custom Properties (Variablen) für Theming, Mobile-First Responsive Design

---

## Dateistruktur

```
BeatMaster/
├── index.html                          # Haupteinstiegspunkt
├── manifest.json                       # PWA-Manifest
├── sw.js                              # Service Worker
│
├── css/
│   ├── main.css                       # CSS-Variablen, Reset, globale Styles
│   ├── components.css                 # Wiederverwendbare Komponenten (Buttons, Cards, Modals)
│   ├── screens.css                    # Screen-spezifische Layouts
│   └── responsive.css                 # Media Queries
│
├── js/
│   ├── app.js                         # Haupt-App-Initialisierung & SPA-Router
│   ├── state.js                       # Globales State-Management (Observable Pattern)
│   ├── config.js                      # App-Konfigurationskonstanten
│   │
│   ├── modules/
│   │   ├── storage.js                 # LocalStorage-Abstraktionsschicht
│   │   ├── database.js                # Song-Datenbank CRUD-Operationen
│   │   ├── youtube-player.js          # YouTube IFrame API Wrapper
│   │   ├── game-engine.js             # Kern-Spiellogik & Ablaufsteuerung
│   │   ├── question-generator.js      # Fragenauswahl & -generierung
│   │   ├── scoring.js                 # Punkteberechnung & Validierung
│   │   ├── timer.js                   # Spiel-Timer (Timestamp-basiert)
│   │   └── utils.js                   # Hilfsfunktionen
│   │
│   └── screens/
│       ├── home.js                    # Startscreen-Controller
│       ├── database-manager.js        # Song-Datenbank-UI
│       ├── game-setup.js              # Spiel-Konfiguration
│       ├── gameplay.js                # Aktiver Gameplay-Controller
│       ├── scoreboard.js              # Live-Scoreboard
│       ├── results.js                 # Endergebnis & Siegerehrung
│       ├── settings.js                # App-Einstellungen
│       └── history.js                 # Spiel-Historie Viewer
│
├── data/
│   └── default-songs.json             # Beispiel-Songs (50+ Songs)
│
├── assets/
│   ├── icons/                         # PWA-Icons (72px bis 512px)
│   ├── sounds/                        # Soundeffekte (optional)
│   └── images/
│
└── README.md
```

---

## Daten-Schemas

### Song-Datenbank Schema
**LocalStorage Key:** `beatmaster_songs`

```javascript
{
  "songs": [
    {
      "id": "uuid-v4",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "year": 1975,
      "genre": "Rock",
      "album": "A Night at the Opera",
      "youtubeId": "fJ9rUzIMcZQ",
      "startTime": 30,              // Optional: Wiedergabe-Startposition
      "duration": 20,               // Optional: Clip-Dauer (Standard: 30s)
      "difficulty": "medium",        // easy, medium, hard
      "tags": ["classic", "70s"],
      "playCount": 0,
      "lastPlayed": null,
      "createdAt": "ISO-timestamp",
      "updatedAt": "ISO-timestamp"
    }
  ],
  "version": "1.0"
}
```

### Spielstatus Schema
**SessionStorage Key:** `beatmaster_game_state`

```javascript
{
  "gameId": "uuid",
  "mode": "classic",              // classic, speed, marathon
  "status": "playing",            // setup, playing, paused, completed
  "currentRound": 1,
  "totalRounds": 10,
  "currentTeamIndex": 0,
  "currentSongId": "uuid",
  "currentQuestion": {
    "type": "song_title",         // song_title, artist, year, genre, decade
    "correctAnswer": "Bohemian Rhapsody",
    "points": 100,
    "timeLimit": 30,
    "startedAt": "ISO-timestamp"
  },
  "teams": [
    {
      "id": "uuid",
      "name": "Team Rockstars",
      "color": "#FF6B6B",
      "score": 450,
      "roundScores": [100, 50, 0, 150, 150],
      "correctAnswers": 4,
      "wrongAnswers": 1,
      "streak": 2
    }
  ],
  "playedSongs": ["song-id-1", "song-id-2"],
  "playlist": ["song-id-3", "song-id-4"],
  "settings": {
    "questionsPerRound": 1,
    "pointsPerCorrect": 100,
    "bonusStreakPoints": 50,
    "yearTolerance": 2,
    "playbackDuration": 30,
    "questionTypes": ["song_title", "artist", "year", "genre", "decade"],
    "questionWeights": {
      "song_title": 3,
      "artist": 3,
      "year": 1,
      "genre": 2,
      "decade": 1
    }
  }
}
```

### Einstellungen Schema
**LocalStorage Key:** `beatmaster_settings`

```javascript
{
  "general": {
    "theme": "dark",
    "soundEffects": true,
    "soundVolume": 0.7,
    "animations": true
  },
  "gameDefaults": {
    "mode": "classic",
    "rounds": 10,
    "teamCount": 2,
    "pointsPerCorrect": 100,
    "bonusStreakPoints": 50,
    "yearTolerance": 2,
    "playbackDuration": 30
  }
}
```

---

## Wichtige Algorithmen

### 1. Fragenauswahl (Gewichtete Zufallsauswahl)

```javascript
// question-generator.js
function selectQuestionType(song, config, recentTypes = []) {
  // Filtere Typen basierend auf verfügbaren Song-Metadaten
  const availableTypes = config.questionTypes.filter(type => {
    switch(type) {
      case 'song_title': return !!song.title;
      case 'artist': return !!song.artist;
      case 'year': return !!song.year;
      case 'genre': return !!song.genre;
      case 'decade': return !!song.year;
      default: return false;
    }
  });

  // Wende Gewichtungen mit Anti-Wiederholungs-Penalty an
  const weights = availableTypes.map(type => {
    const baseWeight = config.questionWeights[type] || 1;
    const recentPenalty = recentTypes.includes(type) ? 0.3 : 1;
    return baseWeight * recentPenalty;
  });

  // Gewichtete Zufallsauswahl
  return weightedRandomSelect(availableTypes, weights);
}
```

### 2. Antwort-Validierung (Fuzzy Matching)

```javascript
// scoring.js
function validateAnswer(userAnswer, correctAnswer, questionType, config) {
  switch(questionType) {
    case 'song_title':
    case 'artist':
      // Fuzzy String Matching (80% Ähnlichkeitsschwelle)
      // Normalisiert: Kleinbuchstaben, entfernt Artikel (the/a/an), Satzzeichen
      return fuzzyMatchStrings(userAnswer, correctAnswer, 0.8);

    case 'year':
      // Toleranzbereich (±2 Jahre)
      const userYear = parseInt(userAnswer);
      const correctYear = parseInt(correctAnswer);
      return Math.abs(userYear - correctYear) <= config.yearTolerance;

    case 'genre':
    case 'decade':
      // Exakte Übereinstimmung (case-insensitive)
      return normalizeString(userAnswer) === normalizeString(correctAnswer);
  }
}
```

### 3. Intelligente Playlist-Generierung

```javascript
// database.js
function generatePlaylist(config, playedSongs = []) {
  let candidates = Database.getAllSongs();

  // Wende Filter an (Genre, Dekade, Tags)
  candidates = Database.filterSongs(candidates, config.filters);

  // Entferne kürzlich gespielte Songs
  candidates = candidates.filter(s => !playedSongs.slice(-20).includes(s.id));

  // Stelle Interpreten-Vielfalt sicher (verhindere Clustering)
  const playlist = [];
  const usedArtists = new Set();

  while (playlist.length < config.totalRounds && candidates.length > 0) {
    let pool = candidates.filter(s => !usedArtists.has(s.artist));
    if (pool.length === 0) {
      pool = candidates;
      usedArtists.clear();
    }

    const song = pool[Math.floor(Math.random() * pool.length)];
    playlist.push(song.id);
    usedArtists.add(song.artist);
    candidates = candidates.filter(s => s.id !== song.id);

    // Lösche Tracking alle 5 Songs
    if (playlist.length % 5 === 0) usedArtists.clear();
  }

  return playlist;
}
```

### 4. Punkteberechnung (mit Boni)

```javascript
// scoring.js
function calculatePoints(context) {
  const { isCorrect, basePoints, difficulty, timeRemaining,
          timeLimit, currentStreak, config } = context;

  if (!isCorrect) return 0;

  // Basispunkte nach Schwierigkeit
  let points = basePoints;
  if (difficulty === 'hard') points *= 1.5;
  else if (difficulty === 'easy') points *= 0.8;

  // Zeitbonus (max 20% der Basispunkte)
  if (timeRemaining > 0) {
    const timeBonus = (timeRemaining / timeLimit) * (basePoints * 0.2);
    points += Math.floor(timeBonus);
  }

  // Streak-Bonus
  if (currentStreak >= 2) {
    const streakBonus = (currentStreak - 1) * config.bonusStreakPoints;
    points += streakBonus;
  }

  return Math.floor(points);
}
```

### 5. Präziser Timer (Timestamp-basiert)

```javascript
// timer.js
class Timer {
  start(duration, onTick, onComplete) {
    this.endTime = Date.now() + (duration * 1000);
    this.interval = setInterval(() => {
      const remaining = Math.max(0, this.endTime - Date.now()) / 1000;
      onTick(remaining);

      if (remaining <= 0) {
        this.stop();
        onComplete();
      }
    }, 100); // Prüfe alle 100ms für flüssige Updates
  }
}
```

---

## Kritische technische Herausforderungen & Lösungen

### Herausforderung 1: YouTube IFrame API Laden
**Problem:** API lädt asynchron; Spiel kann nicht starten, bis bereit

**Lösung:** Promise-basierter Wrapper mit globalem Ready-State
```javascript
// youtube-player.js
let apiReadyPromise = null;

function loadAPI() {
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    window.onYouTubeIframeAPIReady = () => resolve();

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });

  return apiReadyPromise;
}
```

### Herausforderung 2: iOS Safari Autoplay-Beschränkungen
**Problem:** iOS blockiert Autoplay; erfordert Benutzerinteraktion

**Lösung:** Zeige "Tippen zum Starten" Button vor jedem Song
```javascript
function loadSongWithIOSSupport(videoId) {
  if (isIOS()) {
    showPlayButton(); // Benutzer muss tippen
  } else {
    player.loadVideo(videoId);
    player.playVideo(); // Auto-Play auf anderen Plattformen
  }
}
```

### Herausforderung 3: LocalStorage Quota
**Problem:** Große Song-Datenbanken können 5-10MB Limit überschreiten

**Lösung:**
- Speichergröße überwachen
- Warnung bei 80% Kapazität
- Export/Import zum Auslagern von Daten bereitstellen
- Komprimierung für große Datensätze erwägen

### Herausforderung 4: Timer-Drift
**Problem:** `setInterval` driftet über Zeit

**Lösung:** Verwende Timestamp-basierte Berechnung (siehe Timer-Algorithmus oben)

### Herausforderung 5: State-Synchronisation
**Problem:** Mehrere Screens müssen Spielstatus aktualisieren

**Lösung:** Observable Pattern mit Single Source of Truth
```javascript
// state.js
const State = {
  _state: {},
  _observers: {},

  set(key, value) {
    this._state[key] = value;
    this._notify(key, value);
    this._persist(key, value);
  },

  subscribe(key, callback) {
    if (!this._observers[key]) this._observers[key] = [];
    this._observers[key].push(callback);
  }
};
```

---

## Implementierungsphasen (5-7 Wochen)

### **Phase 1: Fundament** (Woche 1)
**Ziel:** Kern-Infrastruktur und Daten-Schicht

**Aufgaben:**
1. Vollständige Dateistruktur erstellen
2. [config.js](js/config.js) implementieren - Alle Konfigurationskonstanten
3. [utils.js](js/modules/utils.js) implementieren - Hilfsfunktionen (UUID, String-Normalisierung, Fuzzy Matching)
4. [state.js](js/state.js) implementieren - Observable State-Management
5. [storage.js](js/modules/storage.js) implementieren - LocalStorage-Abstraktion
6. Basis-HTML-Struktur in [index.html](index.html) erstellen
7. CSS-Framework erstellen ([main.css](css/main.css), [components.css](css/components.css))
8. SPA-Router in [app.js](js/app.js) implementieren

**Deliverables:**
- ✅ Vollständige Dateistruktur
- ✅ Funktionierende Navigation zwischen Platzhalter-Screens
- ✅ State-Management funktional
- ✅ LocalStorage CRUD funktioniert

**Kritische Dateien:**
- [js/state.js](js/state.js)
- [js/modules/storage.js](js/modules/storage.js)
- [js/app.js](js/app.js)

---

### **Phase 2: Song-Datenbank** (Woche 2)
**Ziel:** Vollständiges Song-Management-System

**Aufgaben:**
1. [database.js](js/modules/database.js) implementieren - Song CRUD, Suche, Filter
2. [default-songs.json](data/default-songs.json) mit 50+ Beispiel-Songs erstellen
3. [database-manager.js](js/screens/database-manager.js) Screen implementieren
4. Song Hinzufügen/Bearbeiten/Löschen UI erstellen
5. Such- und Filterfunktionalität implementieren
6. JSON Import/Export hinzufügen
7. YouTube ID-Extraktion aus URLs implementieren

**Deliverables:**
- ✅ Funktionale Song-Datenbank-Verwaltung
- ✅ Import/Export funktioniert
- ✅ Beispiel-Datenbank mit 50+ Songs
- ✅ Suche und Filter funktionieren

**Kritische Dateien:**
- [js/modules/database.js](js/modules/database.js)
- [js/screens/database-manager.js](js/screens/database-manager.js)
- [data/default-songs.json](data/default-songs.json)

---

### **Phase 3: YouTube-Integration** (Woche 2-3)
**Ziel:** Funktionierender YouTube-Player

**Aufgaben:**
1. [youtube-player.js](js/modules/youtube-player.js) implementieren - IFrame API Wrapper
2. Asynchrones API-Laden mit Promises handhaben
3. Wiedergabesteuerung implementieren (Play/Pause/Stop/Seek)
4. Player-UI-Komponente erstellen
5. Auf iOS Safari testen (Autoplay-Beschränkungen)
6. Fehlerbehandlung für ungültige Videos implementieren
7. Wiedergabe-Timing-Steuerung hinzufügen (Startzeit, Dauer)

**Deliverables:**
- ✅ YouTube-Player lädt und spielt Videos
- ✅ Wiedergabesteuerung funktioniert
- ✅ Mobile Kompatibilität (iOS/Android) verifiziert
- ✅ Fehlerbehandlung für nicht verfügbare Videos

**Kritische Dateien:**
- [js/modules/youtube-player.js](js/modules/youtube-player.js)

---

### **Phase 4: Spiel-Engine** (Woche 3-4)
**Ziel:** Kern-Spiellogik und Fragensystem

**Aufgaben:**
1. [timer.js](js/modules/timer.js) implementieren - Timestamp-basierter Timer
2. [question-generator.js](js/modules/question-generator.js) implementieren - Fragenauswahl mit gewichteter Zufallsauswahl
3. [scoring.js](js/modules/scoring.js) implementieren - Punkteberechnung, Antwort-Validierung mit Fuzzy Matching
4. [game-engine.js](js/modules/game-engine.js) implementieren - Spielablauf, State Machine, Event-System
5. Fragengenerierungs-Algorithmen testen
6. Antwort-Validierung mit Edge Cases testen (Tippfehler, alternative Schreibweisen)
7. Spielstatus-Persistierung implementieren

**Deliverables:**
- ✅ Fragengenerierung für alle Typen (Titel, Interpret, Jahr, Genre, Dekade)
- ✅ Antwort-Validierung präzise (Fuzzy Matching, Jahr-Toleranz)
- ✅ Punkteberechnung korrekt (Basis + Zeitbonus + Streak)
- ✅ Spielstatus speichert/lädt korrekt

**Kritische Dateien:**
- [js/modules/game-engine.js](js/modules/game-engine.js)
- [js/modules/question-generator.js](js/modules/question-generator.js)
- [js/modules/scoring.js](js/modules/scoring.js)
- [js/modules/timer.js](js/modules/timer.js)

---

### **Phase 5: Spiel-UI** (Woche 4-5)
**Ziel:** Vollständiges Spielerlebnis

**Aufgaben:**
1. [game-setup.js](js/screens/game-setup.js) implementieren - Spiel-Konfigurationsscreen
2. [gameplay.js](js/screens/gameplay.js) implementieren - Aktiver Gameplay-Screen
3. [scoreboard.js](js/screens/scoreboard.js) implementieren - Live-Scoreboard zwischen Runden
4. [results.js](js/screens/results.js) implementieren - Endergebnis & Siegerehrung
5. Spiel-Engine mit UI verbinden
6. Runden-Übergänge mit Animationen implementieren
7. Visuelles Feedback hinzufügen (richtig/falsch, gewonnene Punkte)
8. Vollständigen Spielablauf testen

**Deliverables:**
- ✅ End-to-End Spiel spielbar
- ✅ Alle Screens funktional
- ✅ Flüssige Übergänge
- ✅ Echtzeit-Score-Updates

**Kritische Dateien:**
- [js/screens/game-setup.js](js/screens/game-setup.js)
- [js/screens/gameplay.js](js/screens/gameplay.js)
- [js/screens/scoreboard.js](js/screens/scoreboard.js)
- [js/screens/results.js](js/screens/results.js)

---

### **Phase 6: Polish & Features** (Woche 5-6)
**Ziel:** Verbesserte UX und zusätzliche Features

**Aufgaben:**
1. [settings.js](js/screens/settings.js) implementieren - App-Einstellungsscreen
2. [history.js](js/screens/history.js) implementieren - Spiel-Historie Viewer
3. [home.js](js/screens/home.js) implementieren - Startscreen mit Menü
4. Siegerehrungs-Animationen hinzufügen (Konfetti für Gewinner)
5. Soundeffekte hinzufügen (optional)
6. Lade-Zustände und Fehlermeldungen implementieren
7. Responsive Design verfeinern
8. Cross-Browser Testing (Chrome, Firefox, Safari, Edge)

**Deliverables:**
- ✅ Einstellungen funktional
- ✅ Historie-Tracking funktioniert
- ✅ Polierte UX
- ✅ Mobile/Tablet responsive

**Kritische Dateien:**
- [js/screens/settings.js](js/screens/settings.js)
- [js/screens/history.js](js/screens/history.js)
- [css/responsive.css](css/responsive.css)

---

### **Phase 7: PWA & Deployment** (Woche 6-7)
**Ziel:** Produktionsreife PWA

**Aufgaben:**
1. Alle PWA-Icons erstellen (72px, 96px, 128px, 144px, 192px, 384px, 512px)
2. [manifest.json](manifest.json) mit vollständigen Metadaten erstellen
3. [sw.js](sw.js) implementieren - Service Worker mit Cache-First-Strategie
4. Offline-Funktionalität testen (UI funktioniert offline, YouTube benötigt Internet)
5. Installationsablauf auf Android (Chrome) und iOS (Safari) testen
6. Performance-Optimierung (Lighthouse Audit)
7. Auf Unraid-Server deployen (Docker Container mit Nginx)
8. Benutzerdokumentation erstellen

**Deliverables:**
- ✅ Installierbare PWA auf Android/iOS
- ✅ Offline-UI funktioniert (YouTube benötigt Internet)
- ✅ Produktions-Deployment auf Unraid
- ✅ Dokumentation vollständig

**Kritische Dateien:**
- [manifest.json](manifest.json)
- [sw.js](sw.js)
- [assets/icons/](assets/icons/)

---

## Responsive Design Strategie

### Breakpoints
- **Mobile Portrait:** 320px - 767px (Standard)
- **Mobile Landscape / Tablet Portrait:** 768px - 1023px
- **Tablet Landscape / Desktop:** 1024px+

### Layout-Muster
- **Mobile Portrait:** Einzelne Spalte, volle Breite Cards, Bottom Navigation
- **Mobile Landscape:** Zwei Spalten für Gameplay (Video + Scoreboard nebeneinander)
- **Tablet:** Grid-Layout, modale Dialoge statt Vollbild-Formularen
- **Desktop:** Mehrspaltiges Dashboard, persistente Sidebar-Navigation

### Orientierungs-Handling
```css
@media (orientation: landscape) and (max-height: 500px) {
  /* Kompaktes Layout für Landscape-Gameplay auf Handys */
}
```

---

## PWA-Konfiguration

### manifest.json
```json
{
  "name": "BeatMaster - Musikquiz Spiel",
  "short_name": "BeatMaster",
  "description": "Party-Musikquiz Spiel",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#e94560",
  "orientation": "any",
  "icons": [
    { "src": "/assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Strategie
- **Cache-First:** Alle App-Shell-Dateien (HTML, CSS, JS, Icons)
- **Network-Only:** YouTube API Anfragen
- **Update-Strategie:** Cache-Versionierung, Auto-Update bei Aktivierung

---

## Test-Checkliste

### Funktionale Tests
- [ ] Song CRUD-Operationen
- [ ] Songs suchen und filtern
- [ ] JSON Import/Export
- [ ] YouTube-Wiedergabe
- [ ] Timer-Genauigkeit
- [ ] Alle Fragentypen
- [ ] Antwort-Validierung (Fuzzy Matching)
- [ ] Punkteberechnung (Basis + Boni)
- [ ] Team-Rotation
- [ ] Runden-Fortschritt
- [ ] Spielstatus-Persistierung

### Edge Cases
- [ ] Leere Song-Datenbank (zeige Onboarding)
- [ ] Einzelner Song (verhindere Start oder erlaube Wiederholung)
- [ ] YouTube-Video nicht verfügbar (Fehlerbehandlung)
- [ ] Kein Internet (erkennen und warnen)
- [ ] LocalStorage voll (graceful handling)
- [ ] Sehr lange Teamnamen (UI abschneiden)
- [ ] Sonderzeichen in Eingaben (HTML escapen)

### Responsive Tests
- [ ] Mobile Portrait (320px-767px)
- [ ] Mobile Landscape
- [ ] Tablet Portrait/Landscape
- [ ] Desktop (1024px+)

### Browser-Kompatibilität
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox
- [ ] Safari (Desktop & iOS)
- [ ] Edge

### PWA-Tests
- [ ] Installation auf Android (Chrome)
- [ ] Installation auf iOS (Safari)
- [ ] Offline-UI lädt
- [ ] Service Worker cached Assets
- [ ] Standalone-Modus funktioniert

---

## Deployment auf Unraid

### Docker Setup
Erstelle Docker Container mit Nginx zum Servieren statischer Dateien:

**docker-compose.yml:**
```yaml
version: '3'
services:
  beatmaster:
    image: nginx:alpine
    container_name: beatmaster
    ports:
      - "8080:80"
    volumes:
      - /mnt/user/appdata/beatmaster/www:/usr/share/nginx/html:ro
    restart: unless-stopped
```

**Deployment-Schritte:**
1. Ordner erstellen: `/mnt/user/appdata/beatmaster/www`
2. Alle Dateien nach `/mnt/user/appdata/beatmaster/www/` kopieren
3. Ausführen: `docker-compose up -d`
4. Zugriff: `http://unraid-ip:8080`

### Netzwerkzugriff-Optionen
1. **Lokales Netzwerk:** Unraid-IP + Port mit Freunden teilen
2. **Tailscale VPN:** Tailscale-Container installieren, Freunde einladen
3. **Wireguard:** Vorhandenes Wireguard-Setup nutzen (falls verfügbar)

---

## Sicherheitsüberlegungen

### XSS-Prävention
```javascript
// Benutzereingaben immer escapen vor dem Rendern
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### Input-Validierung
- Alle Song-Daten validieren (Titellänge, Jahresbereich, YouTube-ID-Format)
- Vor dem Speichern in LocalStorage sanitizen
- JSON-Struktur beim Import validieren
- Maximale Dateigröße für Imports festlegen (10MB)

---

## Zukünftige Erweiterbarkeit (Post-MVP)

### Potenzielle Features
1. **Multiplayer Online:** WebSocket-Server für Echtzeit-Synchronisation
2. **Spotify-Integration:** Alternative zu YouTube
3. **Erweiterte Fragen:** Album-Cover, Lyrics, "Name that Sample"
4. **Benutzerkonten:** Cloud-Sync, globale Bestenlisten
5. **Custom Themes:** Theme Builder
6. **Spracheingabe:** Speech-to-Text Antworten
7. **Statistik-Dashboard:** Detaillierte Analysen

### Architektur unterstützt
- Modulares Design erlaubt Austausch von Musikquellen
- Event-getriebene Spiel-Engine ermöglicht Plugins
- Storage-Abstraktion erlaubt Migration zu IndexedDB oder Remote API
- Config-getriebene Fragentypen erlauben einfache Ergänzungen

---

## Erfolgskriterien

Das MVP ist vollständig wenn:

✅ App läuft stabil ohne Crashes
✅ Alle Kernfunktionen funktional (Datenbank, Gameplay, Scoring, Historie)
✅ Installierbar als PWA auf Android/iOS
✅ Responsive auf Mobile/Tablet/Desktop
✅ Mindestens 50 Songs in Standard-Datenbank
✅ Deployed auf Unraid-Server
✅ 5+ Benutzer können ohne Probleme spielen
✅ Positives Benutzerfeedback (>4/5 Zufriedenheit)

---

## Nächste Schritte

1. **Plan reviewen** - Ansatz und Architektur bestätigen
2. **Phase 1 starten** - Fundament bauen (State, Storage, Router, CSS-Framework)
3. **Wöchentliche Check-ins** - Fortschritt reviewen, Timeline bei Bedarf anpassen
4. **Songs sammeln** - Beginne 50+ Lieblingssongs mit YouTube-Links zu sammeln
5. **Früh und oft testen** - Jede Phase validieren bevor weitergemacht wird

**Bereit zum Bauen?** Lass uns mit Phase 1: Fundament beginnen!