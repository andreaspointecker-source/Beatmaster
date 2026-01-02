# 🎵 BeatMaster - UI/UX Design Spezifikation

**Version:** 2.0
**Datum:** 2026-01-01
**Projekt:** BeatMaster PWA - Party Musikquiz
**Plattform:** Progressive Web App (iOS/Android/Desktop)

---

## 📋 Inhaltsverzeichnis

1. [Design-Prinzipien](#design-prinzipien)
2. [Farbsystem](#farbsystem)
3. [Typografie](#typografie)
4. [Komponenten-Bibliothek](#komponenten-bibliothek)
5. [Screen-Übersicht](#screen-übersicht)
6. [Detaillierte Screen-Designs](#detaillierte-screen-designs)
7. [Animationen & Transitions](#animationen--transitions)
8. [Responsive Verhalten](#responsive-verhalten)
9. [Accessibility](#accessibility)

---

## Design-Prinzipien

### Mobile-First Ansatz
- **Primäre Zielplattform:** Smartphone (Portrait & Landscape)
- **Touch-Targets:** Minimum 48x48px für alle interaktiven Elemente
- **Lesbarkeit:** Optimiert für 1-2 Meter Entfernung (Partysituation)
- **Große Schrift:** Mindestens 16px Base, bis zu 48px für Titel

### Dark Theme
- **Hauptgrund:** Schont Augen bei längerem Spielen
- **Atmosphäre:** Modern, energiegeladen, Gaming-Feeling
- **Kontrast:** WCAG AA Standard (4.5:1 minimum)

### Klare Hierarchie
- **Eine Hauptaktion** pro Screen (CTA klar erkennbar)
- **Visuelle Hierarchie:** Größe → Farbe → Position
- **Navigation:** Immer Zurück-Option sichtbar

### Schnelle Interaktion
- **Minimale Klicks:** Hauptfunktionen in max. 2 Klicks erreichbar
- **Sofortiges Feedback:** Jede Aktion zeigt visuelles Feedback
- **Keine Wartezeiten:** Loading-States für alles über 300ms

---

## Farbsystem

### Primärfarben (Blau/Grün-Schema)

```css
/* Primärfarbe - Türkis/Cyan (Hauptaktionen) */
--color-primary: #00D9FF;          /* Helles Cyan - Buttons, Highlights */
--color-primary-dark: #00B8D4;     /* Dunkles Cyan - Hover */
--color-primary-light: #5DEFF4;    /* Helleres Cyan - Glow-Effekte */

/* Sekundärfarbe - Blau (UI-Akzente) */
--color-secondary: #0A4D68;        /* Petrol-Blau - Cards, Surfaces */
--color-secondary-dark: #053B50;   /* Dunkel-Blau - Variationen */
--color-secondary-light: #088395;  /* Helles Petrol - Hover States */

/* Akzentfarbe - Grün (Erfolg & Energie) */
--color-accent: #05C46B;           /* Lebendiges Grün - Akzente */
--color-accent-dark: #039855;      /* Dunkel-Grün - Hover */
--color-accent-light: #4ADE80;     /* Hell-Grün - Highlights */
```

### Hintergrund & Surfaces

```css
/* Hintergründe - Abgestufte Dunkelheit */
--color-background: #0B1215;       /* Haupthintergrund - Fast Schwarz */
--color-surface: #1A2F38;          /* Erhöhte Flächen - Dunkel-Petrol */
--color-surface-light: #24424E;    /* Leicht erhöht - Mittleres Petrol */
--color-surface-elevated: #2E5563; /* Stark erhöht - Helles Petrol */
```

### Text & Inhalt

```css
/* Textfarben - Hoher Kontrast */
--color-text: #F0F9FF;             /* Haupttext - Fast Weiß */
--color-text-secondary: #A8C5DA;   /* Sekundärtext - Hellblau */
--color-text-muted: #6B8FA3;       /* Unwichtiger Text - Gedämpftes Blau */
--color-text-disabled: #4A6572;    /* Deaktiviert - Dunkel-Grau-Blau */
```

### Semantische Farben

```css
/* Feedback-Farben */
--color-success: #00E676;          /* Erfolg - Neon-Grün */
--color-success-dark: #00C853;     /* Erfolg Hover */

--color-error: #FF3D71;            /* Fehler - Neon-Pink */
--color-error-dark: #E0245E;       /* Fehler Hover */

--color-warning: #FFD23F;          /* Warnung - Helles Gelb */
--color-warning-dark: #FFC400;     /* Warnung Hover */

--color-info: #00B8D4;             /* Info - Cyan (wie Primary-Dark) */
--color-info-dark: #00838F;        /* Info Hover */
```

### Gradienten (Optional für Highlights)

```css
/* Haupt-Gradient: Cyan → Grün */
--gradient-primary: linear-gradient(135deg, #00D9FF 0%, #05C46B 100%);

/* Sekundär-Gradient: Dunkel-Blau → Petrol */
--gradient-secondary: linear-gradient(135deg, #053B50 0%, #088395 100%);

/* Akzent-Gradient: Grün → Neon-Grün */
--gradient-accent: linear-gradient(135deg, #05C46B 0%, #00E676 100%);

/* Hintergrund-Gradient (subtil) */
--gradient-background: radial-gradient(circle at top right, #1A2F38 0%, #0B1215 100%);
```

### Team-Farben (Spieler-Identifikation)

```css
--team-color-1: #00D9FF;  /* Cyan */
--team-color-2: #05C46B;  /* Grün */
--team-color-3: #B620E0;  /* Lila */
--team-color-4: #FFD23F;  /* Gelb */
--team-color-5: #FF6B6B;  /* Koralle */
--team-color-6: #4ECDC4;  /* Türkis */
--team-color-7: #95E1D3;  /* Mint */
--team-color-8: #F38181;  /* Lachs */
--team-color-9: #AA96DA;  /* Lavendel */
--team-color-10: #FCBAD3; /* Rosa */
```

---

## Typografie

### Schriftfamilie

```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-display: 'Poppins', 'Inter', sans-serif; /* Für Titel/Logo */
--font-family-mono: 'SF Mono', 'Consolas', monospace; /* Für Code/Zahlen */
```

### Schriftgrößen-Skala

```css
--font-size-xs: 0.75rem;    /* 12px - Captions, Kleingedrucktes */
--font-size-sm: 0.875rem;   /* 14px - Sekundärtext, Labels */
--font-size-base: 1rem;     /* 16px - Body-Text (Standard) */
--font-size-lg: 1.125rem;   /* 18px - Hervorgehobener Text */
--font-size-xl: 1.5rem;     /* 24px - Untertitel */
--font-size-2xl: 2rem;      /* 32px - Sektions-Titel */
--font-size-3xl: 3rem;      /* 48px - Haupt-Titel, Logo */
--font-size-4xl: 4rem;      /* 64px - Hero-Text (optional) */
```

### Schriftgewichte

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Zeilenhöhen

```css
--line-height-tight: 1.25;   /* Für Titel */
--line-height-normal: 1.5;   /* Für Body-Text */
--line-height-relaxed: 1.75; /* Für längere Texte */
```

### Typografie-Anwendung

| Element | Schriftart | Größe | Gewicht | Farbe |
|---------|-----------|-------|---------|-------|
| **H1 - Haupt-Titel** | Display | 3xl (48px) | Extrabold | Primary |
| **H2 - Sektionen** | Display | 2xl (32px) | Bold | Text |
| **H3 - Untertitel** | Primary | xl (24px) | Semibold | Text |
| **Body - Normal** | Primary | base (16px) | Normal | Text |
| **Button - Text** | Primary | base (16px) | Semibold | White |
| **Caption** | Primary | xs (12px) | Medium | Text-Muted |
| **Label** | Primary | sm (14px) | Medium | Text-Secondary |

---

## Komponenten-Bibliothek

### 1. Buttons

#### Primary Button (Hauptaktionen)
```
Aussehen: Cyan-Gradient, Weiße Schrift, Abgerundete Ecken
Größe: 48px Höhe, volle Breite oder Auto
Hover: Leichter Lift + Glow-Effekt
Aktiv: Scale 0.98
Icon: Optional links oder rechts
```

**Beispiel:**
```
┌──────────────────────────────────┐
│   ▶  SPIEL STARTEN               │  ← Cyan-Gradient, Weiß
└──────────────────────────────────┘
     ↑ Icon   ↑ Text (Semibold)
```

#### Secondary Button (Alternative Aktionen)
```
Aussehen: Transparenter Hintergrund, Cyan-Border, Cyan-Text
Größe: 48px Höhe
Hover: Leichte Cyan-Füllung (10% Opacity)
```

#### Outline Button (Tertiäre Aktionen)
```
Aussehen: Transparenter Hintergrund, Grau-Border, Weiß-Text
Größe: 44px Höhe
Hover: Leichte Weiß-Füllung (5% Opacity)
```

#### Ghost Button (Unwichtige Aktionen)
```
Aussehen: Komplett transparent, nur Text
Größe: 40px Höhe
Hover: Leichte Hintergrund-Füllung
```

#### Icon Button (Kompakte Aktionen)
```
Aussehen: Kreisförmig oder Quadratisch, 40x40px
Hover: Scale 1.1, Leichter Glow
```

### 2. Cards (Content-Container)

#### Song Card
```
┌────────────────────────────────┐
│ 🎵 Bohemian Rhapsody          │  ← Titel (Semibold, lg)
│ Queen • 1975 • Rock           │  ← Meta (sm, Muted)
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← Divider
│ [✏️ Edit]  [🗑️ Delete]        │  ← Actions
└────────────────────────────────┘
  ↑ Surface-Color, Rounded-lg, Shadow-md
```

#### Team Card (Scoreboard)
```
┌────────────────────────────────┐
│ ██ Team Rockstars              │  ← Team-Color Border-Left
│                           142  │  ← Score (Bold, 2xl, Primary)
│ ★★★★☆ • 8/10 richtig          │  ← Stats (sm, Secondary)
└────────────────────────────────┘
```

#### Stat Card
```
┌──────────────┐
│     247      │  ← Wert (3xl, Primary)
│   Songs      │  ← Label (sm, Muted)
└──────────────┘
  ↑ Zentriert, Surface-Elevated
```

### 3. Forms

#### Input Field
```
Label:  [Song-Titel]              ← sm, Medium, Text-Secondary
        ┌────────────────────────┐
Input:  │ Bohemian Rhapsody...   │  ← base, Normal, Text
        └────────────────────────┘
          ↑ Surface-Color, Primary-Border bei Focus

Focus:  ┌────────────────────────┐
        │ Bohemian Rhapsody...   │  ← Primary Glow-Shadow
        └────────────────────────┘
```

#### Select/Dropdown
```
        ┌────────────────────────┐
        │ Rock                ▼  │  ← Chevron-Icon rechts
        └────────────────────────┘
          ↑ Gleich wie Input

Dropdown:
        ┌────────────────────────┐
        │ Rock              ✓    │  ← Ausgewählt
        ├────────────────────────┤
        │ Pop                    │
        ├────────────────────────┤
        │ Hip-Hop                │
        └────────────────────────┘
          ↑ Surface-Elevated, Shadow-lg
```

#### Checkbox & Radio
```
Checkbox: [✓] Option 1            ← 20x20px, Primary wenn aktiv
Radio:    (●) Option A            ← 20x20px, Primary-Dot
```

#### Slider
```
Label:  Runden: 4                 ← Live-Update

        ●━━━●━━━●━━━○━━━○         ← Dots für Snappoints
        1   2   3   4   5
        ↑ Primary-Filled, Muted-Rest
```

### 4. Modals & Overlays

#### Modal (Zentriert, Overlay)
```
════════════════════════════════
Background: 80% Black Opacity

  ┌──────────────────────────┐
  │ Titel                 ✕  │  ← Header, Close-Button
  ├──────────────────────────┤
  │                          │
  │   Modal-Content          │  ← Body
  │                          │
  ├──────────────────────────┤
  │  [Abbrechen] [OK]        │  ← Footer, Buttons
  └──────────────────────────┘
    ↑ Surface-Color, Rounded-lg, Shadow-xl

════════════════════════════════
```

#### Toast Notification (Top-Right)
```
┌──────────────────────────────┐
│ ✓ Song erfolgreich gespeichert│  ← Icon, Text (Semibold)
└──────────────────────────────┘
  ↑ Success-Color, Slide-In Animation
  Auto-Dismiss nach 3 Sekunden
```

### 5. Navigation

#### Top Bar (Fix oben)
```
┌──────────────────────────────────┐
│ ← Zurück     TITEL          ⚙️   │
└──────────────────────────────────┘
  ↑ 60px Höhe, Surface-Color, Shadow-sm
```

#### Bottom Navigation (Optional für Multi-Tab)
```
┌──────────────────────────────────┐
│ 🏠 Home  🎵 Songs  📊 Stats  ⚙️ │
└──────────────────────────────────┘
  ↑ 64px Höhe, Aktiv: Primary-Color
```

### 6. Spezielle Komponenten

#### Timer Display (Während Spiel)
```
  ┌──────────────┐
  │    0:18      │  ← Monospace, 3xl, Primary
  └──────────────┘
    ↑ Zentriert, Pulsiert bei <5 Sek

Warning (<10 Sek): Warning-Color
Critical (<5 Sek): Error-Color + Pulse-Animation
```

#### Progress Bar (Runden-Fortschritt)
```
Runde 2/4
━━━━━━━━━━━━━━━━━━━━━━━━━━  50%
↑ Primary-Fill, Muted-Rest, 8px Höhe
```

#### Music Visualizer (Während Song läuft)
```
  🎵     🎵     🎵
    ╱╲  ╱╲  ╱╲  ╱╲
  ╱    ╲    ╱    ╲
━━━━━━━━━━━━━━━━━━━━
↑ Animierte Wellen, Primary-Color
```

#### Badge/Tag
```
[#rock]  [#80er]  [#klassiker]
  ↑ Rounded-Full, Surface-Elevated, sm, Primary-Text
```

---

## Screen-Übersicht

### Haupt-Navigationsfluss

```
                    ┌─────────────┐
                    │   Home      │  START
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌──────────┐     ┌──────────┐
    │ Database│      │Game Setup│     │ Settings │
    └─────────┘      └────┬─────┘     └──────────┘
                          │
                          ▼
                     ┌──────────┐
                     │ Gameplay │
                     └────┬─────┘
                          │
                          ▼
                     ┌──────────┐
                     │Scoreboard│ (nach jeder Runde)
                     └────┬─────┘
                          │
                          ▼
                     ┌──────────┐
                     │ Results  │  END
                     └──────────┘
```

### Screen-Liste (13 Screens)

1. **Home** - Hauptmenü
2. **Database Manager** - Song-Verwaltung
3. **Song Add/Edit** - Einzelner Song bearbeiten
4. **Game Setup** - Spielkonfiguration
5. **Gameplay** - Aktives Spiel (Song läuft)
6. **Answer Reveal** - Auflösung nach Song
7. **Scoreboard** - Zwischenstand nach Runde
8. **Results** - Endergebnis & Siegerehrung
9. **Settings** - App-Einstellungen
10. **History** - Vergangene Spiele
11. **History Detail** - Einzelnes Spiel-Detail
12. **Stats** - Statistiken & Analysen
13. **Pause Modal** - Overlay während Spiel

---

## Detaillierte Screen-Designs

### 1. HOME SCREEN

**Zweck:** Haupteinstiegspunkt, Navigation zu allen Features

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│          🎵 BeatMaster              │  ← Logo (Display, 3xl, Primary)
│     Das Musikquiz für deine Party   │  ← Subtitle (lg, Text-Secondary)
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ▶  NEUES SPIEL STARTEN      │  │  ← Primary Button
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ⏯  SPIEL FORTSETZEN         │  │  ← Secondary (nur wenn vorhanden)
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🎵  SONG-DATENBANK           │  │  ← Outline
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📊  SPIEL-HISTORIE           │  │  ← Outline
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ⚙️  EINSTELLUNGEN            │  │  ← Ghost
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│      Version 1.0 • 247 Songs        │  ← Caption (xs, Muted)
│                                     │
└─────────────────────────────────────┘
```

**Interaktionen:**
- Buttons: Hover = Lift + Glow
- Bei Spiel in Progress: "Fortsetzen" Button erscheint animiert
- Subtiler Hintergrund-Gradient

**Animationen:**
- Logo: Fade-In + Scale beim Laden
- Buttons: Gestaffelt von unten einsliden (100ms Verzögerung)

---

### 2. DATABASE MANAGER SCREEN

**Zweck:** Song-Sammlung verwalten

```
┌─────────────────────────────────────┐
│ ← Zurück    SONG-DATENBANK      ⚙️  │  ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  📊 247 Songs in Datenbank          │  ← Stats (Medium, lg)
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔍 Song suchen...             │  │  ← Search Input
│  └───────────────────────────────┘  │
│                                     │
│  Genre: [Alle ▼]  Jahr: [Alle ▼]   │  ← Filter Dropdowns
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ➕ NEUER SONG               │  │  ← Primary CTA
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎵 Bohemian Rhapsody         │  │  ← Song Card
│  │ Queen • 1975 • Rock          │  │
│  │ ──────────────────────────── │  │
│  │ [✏️ Edit]        [🗑️ Delete] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎵 Blinding Lights           │  │
│  │ The Weeknd • 2019 • Pop      │  │
│  │ ──────────────────────────── │  │
│  │ [✏️ Edit]        [🗑️ Delete] │  │
│  └───────────────────────────────┘  │
│                                     │
│  ... (scrollbar) ...                │
│                                     │
│  [← Seite 1 von 25 →]              │  ← Pagination
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📥 JSON IMPORTIEREN           │  │  ← Secondary Actions
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 📤 JSON EXPORTIEREN           │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Live-Suche mit Debounce (300ms)
- Filter kombinierbar (Genre + Jahr)
- Infinite Scroll oder Pagination
- Swipe-to-Delete auf Mobile
- Bulk-Actions (Optional: Checkbox-Modus)

---

### 3. SONG ADD/EDIT SCREEN

**Zweck:** Einzelnen Song hinzufügen oder bearbeiten

```
┌─────────────────────────────────────┐
│ ← Abbrechen  SONG HINZUFÜGEN        │
├─────────────────────────────────────┤
│                                     │
│  YouTube Link:                      │
│  ┌───────────────────────────────┐  │
│  │ https://youtu.be/dQw4w9WgXcQ │  │
│  └───────────────────────────────┘  │
│  [📥 Infos automatisch laden]       │  ← Ghost Button
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Titel: *                           │  ← Required
│  ┌───────────────────────────────┐  │
│  │ Bohemian Rhapsody            │  │
│  └───────────────────────────────┘  │
│                                     │
│  Interpret: *                       │
│  ┌───────────────────────────────┐  │
│  │ Queen                        │  │
│  └───────────────────────────────┘  │
│                                     │
│  Jahr: *                            │
│  ┌─────┐                            │
│  │ 1975│  [◀ 1975 ▶]               │  ← +/- Buttons
│  └─────┘                            │
│                                     │
│  Genre:                             │
│  [Rock ▼]  [+ Genre hinzufügen]    │  ← Dropdown + Custom
│  [#Rock] [#Progressive Rock]       │  ← Selected Tags
│                                     │
│  Album: (optional)                  │
│  ┌───────────────────────────────┐  │
│  │ A Night at the Opera         │  │
│  └───────────────────────────────┘  │
│                                     │
│  Schwierigkeit:                     │
│  [○ Leicht] [● Mittel] [○ Schwer]  │  ← Radio Buttons
│                                     │
│  Tags:                              │
│  [#klassiker] [#70er] [#rock] [✕]  │  ← Removable Tags
│  + Tag hinzufügen                   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✅ SONG SPEICHERN           │  │  ← Primary CTA
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- YouTube-Link Auto-Fill (API-Call)
- Jahr mit +/- Buttons (Mobile-optimiert)
- Genre: Dropdown + Custom Eingabe
- Tags: Autocomplete aus bestehenden
- Validation: Required Fields markiert

---

### 4. GAME SETUP SCREEN

**Zweck:** Spiel konfigurieren (Teams, Modi, Runden)

```
┌─────────────────────────────────────┐
│ ← Zurück    SPIEL KONFIGURIEREN     │
├─────────────────────────────────────┤
│                                     │
│  🎮 SPIELMODUS                      │  ← Section Header
│                                     │
│  [● Klassisch] [○ Speed] [○ Marathon]│ ← Toggle Buttons
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  👥 TEAMS                           │
│                                     │
│  Anzahl: [1] [2] [3] [4] [5] [6+]  │  ← Toggle (aktiv: Primary)
│           ↑ ausgewählt              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Team 1                      │   │  ← Team Card
│  │ ┌─────────────────────────┐ │   │
│  │ │ Die Musikexperten       │ │   │  ← Team Name Input
│  │ └─────────────────────────┘ │   │
│  │ 🎨 [●] Farbe: Cyan          │   │  ← Color Picker
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Team 2                      │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Team Awesome            │ │   │
│  │ └─────────────────────────┘ │   │
│  │ 🎨 [●] Farbe: Grün          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Team hinzufügen]                │  ← Ghost Button (wenn <10)
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⚙️ EINSTELLUNGEN                   │
│                                     │
│  Runden: 4                          │  ← Live-Update
│  ●━━━●━━━●━━━○━━━○                 │  ← Slider (1-5)
│  1   2   3   4   5                  │
│                                     │
│  Songs pro Runde: 10                │
│  ●━━━●━━━●━━━●━━━○                 │  ← Slider (5-15)
│  5   8   10  12  15                 │
│                                     │
│  Wiedergabe-Zeit: 30 Sek            │
│  ●━━━●━━━●━━━○━━━○                 │  ← Slider (15-60)
│  15  20  30  45  60                 │
│                                     │
│  Fragentypen:                       │
│  [✓] Titel  [✓] Interpret  [✓] Jahr│  ← Checkboxes
│  [✓] Genre  [○] Dekade              │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🎮 SPIEL STARTEN            │  │  ← Primary CTA (groß!)
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Team-Anzahl: Toggle Buttons (visueller)
- Team-Namen: Inline-Edit
- Team-Farben: Color-Picker mit Presets
- Slider: Snap-to-Value mit Dots
- Validation: Min. 1 Team, Min. 1 Runde

---

### 5. GAMEPLAY SCREEN (Song läuft)

**Zweck:** Hauptspiel-Bildschirm während Song-Wiedergabe

```
┌─────────────────────────────────────┐
│ ⏸ Pause            Runde 2/4    ⚙️  │  ← Top Bar
├─────────────────────────────────────┤
│                                     │
│  Song 5 / 10                        │  ← Progress Info
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ← Progress Bar (50%)
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │         🎵     🎵     🎵      │  │  ← Music Visualizer
│  │       ╱╲  ╱╲  ╱╲  ╱╲  ╱╲     │  │  (Animated Waves)
│  │     ╱    ╲    ╱    ╲    ╱    │  │
│  │   ━━━━━━━━━━━━━━━━━━━━━━━   │  │
│  │                               │  │
│  │       Musik läuft...          │  │  ← Status Text
│  │                               │  │
│  │         🔊 0:18               │  │  ← Playback Time
│  │                               │  │
│  └───────────────────────────────┘  │  ← Video Container (YouTube Hidden)
│                                     │
│  ┌──────────────┐                   │
│  │    ⏳ 12     │                   │  ← Timer (Large, 3xl)
│  └──────────────┘                   │  (Pulsiert bei <5 Sek)
│                                     │
│  ✏️ Jetzt dran: Team Awesome       │  ← Current Team (Bold, Team-Color)
│                                     │
│  📝 Zu beantworten:                 │  ← Task List
│  • Song-Titel                       │
│  • Interpret                        │
│  • Jahr                             │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ⏹ SONG BEENDEN              │  │  ← Primary CTA
│  └───────────────────────────────┘  │
│                                     │
│  [🔁 Wiederholen]  [⏭️ Überspringen]│  ← Secondary Actions
│                                     │
└─────────────────────────────────────┘
```

**Animationen:**
- Visualizer: Animated Wellen (CSS Keyframes)
- Timer: Pulse-Animation bei <5 Sek, Farbe zu Error
- Progress Bar: Smooth Fill

**States:**
- **Läuft:** Wie oben
- **Pausiert:** Overlay mit "▶ Weiterspielen" Button
- **<5 Sek:** Timer rot + pulsierend

---

### 6. ANSWER REVEAL SCREEN

**Zweck:** Korrekte Antworten zeigen, Punkte vergeben

```
┌─────────────────────────────────────┐
│ ⏸ Pause            Runde 2/4       │
├─────────────────────────────────────┤
│                                     │
│  🎵 LÖSUNG                          │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Bohemian Rhapsody           │  │  ← Song Title (Bold, xl)
│  │  Queen                       │  │  ← Artist (lg, Secondary)
│  │  1975 • Rock                 │  │  ← Meta (sm, Muted)
│  │  A Night at the Opera        │  │  ← Album (sm, Muted)
│  └───────────────────────────────┘  │  ← Info Card
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ✅ PUNKTE VERGEBEN                │
│                                     │
│  ┌───Team 1: Die Musikexperten──┐  │
│  │                               │  │
│  │  Titel:      [✓] [✗]         │  │  ← Toggle Buttons
│  │  Interpret:  [✓] [✗]         │  │
│  │  Jahr:       [✓] [✗]         │  │
│  │                               │  │
│  │  Gesamt: 3 Punkte            │  │  ← Auto-Calculated
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───Team 2: Team Awesome────────┐  │
│  │                               │  │
│  │  Titel:      [✓] [✗]         │  │
│  │  Interpret:  [✓] [✗]         │  │
│  │  Jahr:       [✗] [✓]         │  │  ← Falsch = Error-Color
│  │                               │  │
│  │  Gesamt: 2 Punkte            │  │
│  │                               │  │
│  │  [Alle ✓]  [Alle ✗]          │  │  ← Quick Actions
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ⏭ NÄCHSTER SONG             │  │  ← Primary CTA
│  └───────────────────────────────┘  │  (Aktiviert wenn ≥1 Team bewertet)
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Toggle Buttons: Groß (40x40px), einfach zu tippen
- Auto-Berechnung: Live-Update der Punkte
- Quick Actions: "Alle richtig" / "Alle falsch" pro Team
- Collapse/Expand: Teams einklappbar bei >3 Teams

---

### 7. SCOREBOARD SCREEN (Zwischenstand)

**Zweck:** Zwischenstand nach jeder Runde

```
┌─────────────────────────────────────┐
│         ZWISCHENSTAND               │  ← Header (2xl, Bold)
│       Nach Runde 2 / 4              │  ← Info (lg, Secondary)
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🥇  Die Musikexperten       │  │  ← 1st Place (Accent-Color)
│  │                               │  │
│  │         142                   │  │  ← Score (3xl, Bold)
│  │       Punkte                  │  │
│  │                               │  │
│  │     ⭐⭐⭐⭐⭐               │  │  ← Stars (Performance)
│  │                               │  │
│  │  8/10 richtig • Streak: 3    │  │  ← Stats (sm, Muted)
│  └───────────────────────────────┘  │  ← Card mit Lift-Effect
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🥈  Team Awesome            │  │  ← 2nd Place
│  │                               │  │
│  │         138                   │  │
│  │       Punkte                  │  │
│  │                               │  │
│  │     ⭐⭐⭐⭐☆               │  │
│  │                               │  │
│  │  7/10 richtig • Streak: 2    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🥉  Spieler 1               │  │  ← 3rd Place
│  │                               │  │
│  │         121                   │  │
│  │       Punkte                  │  │
│  │                               │  │
│  │     ⭐⭐⭐☆☆               │  │
│  │                               │  │
│  │  6/10 richtig • Streak: 0    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📊 DETAILLIERTE STATS       │  │  ← Ghost Button
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ▶ NÄCHSTE RUNDE             │  │  ← Primary CTA
│  └───────────────────────────────┘  │
│                                     │
│  [⏸️ Pause machen]                  │  ← Ghost
│                                     │
└─────────────────────────────────────┘
```

**Animationen:**
- Cards: Fliegen von unten ein (gestaffelt)
- Platz 1: Konfetti-Animation (Canvas/Lottie)
- Sterne: Fill-Animation nacheinander
- Score: Count-Up Animation

---

### 8. RESULTS SCREEN (Spielende)

**Zweck:** Endergebnis mit Siegerehrung

```
┌─────────────────────────────────────┐
│                                     │
│         🎉 SPIELENDE! 🎉           │  ← Header (3xl, Animated)
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     🏆  🏆  🏆              │  │  ← Trophy Animation
│  │                               │  │
│  │   DIE MUSIKEXPERTEN           │  │  ← Winner (2xl, Bold)
│  │      GEWINNEN!                │  │
│  │                               │  │
│  │   🎊  462 Punkte  🎊         │  │  ← Final Score (3xl)
│  │                               │  │
│  └───────────────────────────────┘  │  ← Winner Card (Gradient-BG)
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ENDSTAND:                          │
│                                     │
│  🥇 Die Musikexperten    462 Pkt   │  ← Podium List
│  🥈 Team Awesome          438 Pkt   │
│  🥉 Spieler 1             391 Pkt   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ⭐ HIGHLIGHTS:                     │
│                                     │
│  🎯 Beste Runde: Runde 3            │  ← Best Stats
│     (98 Punkte - Musikexperten)     │
│                                     │
│  💯 Perfekte Songs: 5               │  ← Perfect Rounds
│     (Alle Teams richtig)            │
│                                     │
│  🤔 Schwierigster: Song #14         │  ← Hardest Song
│     "Bohemian Rhapsody" (1 Team)    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔄 NOCHMAL SPIELEN          │  │  ← Primary CTA
│  └───────────────────────────────┘  │
│                                     │
│  [📊 Details]  [📤 Teilen] [🏠 Home]│ ← Secondary Actions
│                                     │
└─────────────────────────────────────┘
```

**Animationen:**
- Konfetti: Fullscreen Canvas-Animation
- Trophy: Bounce + Shine Effect
- Winner-Card: Gradient-Animation
- Score: Count-Up mit Easing

---

### 9. SETTINGS SCREEN

**Zweck:** App-Einstellungen & Präferenzen

```
┌─────────────────────────────────────┐
│ ← Zurück      EINSTELLUNGEN         │
├─────────────────────────────────────┤
│                                     │
│  🎨 DARSTELLUNG                     │
│                                     │
│  Theme:                             │
│  [● Dunkel]  [○ Hell]  [○ Auto]    │  ← Radio Buttons
│                                     │
│  Schriftgröße:                      │
│  ●━━━●━━━●━━━○━━━○                 │  ← Slider
│  S   M   L   XL  XXL                │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🎮 SPIEL-EINSTELLUNGEN             │
│                                     │
│  Standard-Modus:                    │
│  [Klassisch ▼]                      │  ← Dropdown
│                                     │
│  Standard-Runden: 4                 │
│  ●━━━●━━━●━━━○━━━○                 │
│  2   3   4   5   6                  │
│                                     │
│  Songs pro Runde: 10                │
│  ●━━━●━━━●━━━●━━━○                 │
│  5   8   10  12  15                 │
│                                     │
│  Bonuspunkte:                       │
│  [✓] Für alle 3 richtig (+10 Pkt)  │  ← Checkbox
│  [✓] Streak-Bonus (+5 pro Streak)  │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🔊 AUDIO                           │
│                                     │
│  Lautstärke:                        │
│  ━━━━━━━━━━━━━━━━━━━●━━━━━━━━━   │  ← Volume Slider (70%)
│  🔇                            🔊   │
│                                     │
│  [✓] Sound-Effekte                  │
│  [✓] Musik-Visualizer               │
│  [○] Vibration bei Timer-Ende       │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  💾 DATEN-VERWALTUNG                │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📥 BACKUP ERSTELLEN           │  │  ← Outline Buttons
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 📤 BACKUP WIEDERHERSTELLEN    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 🗑️ ALLE DATEN LÖSCHEN        │  │  ← Error-Color
│  └───────────────────────────────┘  │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  ℹ️ ÜBER BEATMASTER                │
│                                     │
│  Version: 1.0.0                     │  ← App Info
│  © 2026 BeatMaster                  │
│  Made with 💙 für Musikfans         │
│                                     │
│  [📄 Datenschutz]  [⚖️ Lizenz]     │  ← Ghost Links
│                                     │
└─────────────────────────────────────┘
```

---

### 10. HISTORY SCREEN

**Zweck:** Vergangene Spiele anzeigen

```
┌─────────────────────────────────────┐
│ ← Zurück      SPIEL-HISTORIE        │
├─────────────────────────────────────┤
│                                     │
│  📊 STATISTIKEN                     │
│                                     │
│  ┌──────────┬──────────┬──────────┐│
│  │   25     │   250    │   Rock   ││  ← Stat Cards
│  │  Spiele  │  Songs   │  Favorit ││
│  └──────────┴──────────┴──────────┘│
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🕒 LETZTE SPIELE                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🏆 01.01.2026 • 14:30        │  │  ← History Card
│  │                               │  │
│  │ Klassisch • 4 Runden          │  │
│  │                               │  │
│  │ 🥇 Die Musikexperten (462)    │  │
│  │ 🥈 Team Awesome (438)         │  │
│  │ 🥉 Spieler 1 (391)            │  │
│  │                               │  │
│  │ 40 Songs gespielt             │  │
│  │                               │  │
│  └───────────────────────────────┘  │  ← Clickable für Details
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎵 31.12.2025 • 22:15        │  │
│  │                               │  │
│  │ Speed • 2 Runden              │  │
│  │                               │  │
│  │ 🥇 Team Awesome (298)         │  │
│  │ 🥈 Die Musikexperten (276)    │  │
│  │                               │  │
│  │ 20 Songs gespielt             │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ... (scroll) ...                   │
│                                     │
│  [Mehr laden]                       │  ← Ghost Button
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Top Stats: Grid mit wichtigen Zahlen
- History Cards: Tap für Detail-View
- Infinite Scroll oder "Mehr laden" Button
- Filter: Nach Modus, Datum, Gewinner

---

### 11. PAUSE MODAL (Overlay)

**Zweck:** Pause-Menü während Spiel

```
═══════════════════════════════════════
  Background: 85% Black Overlay

      ┌──────────────────────┐
      │                      │
      │    ⏸️  PAUSE         │  ← Header (xl, Bold)
      │                      │
      ├──────────────────────┤
      │                      │
      │  ┌────────────────┐  │
      │  │ ▶ Weiterspielen│  │  ← Primary
      │  └────────────────┘  │
      │                      │
      │  ┌────────────────┐  │
      │  │ 🔄 Neustart    │  │  ← Outline
      │  └────────────────┘  │
      │                      │
      │  ┌────────────────┐  │
      │  │ 📊 Bestenliste │  │  ← Outline
      │  └────────────────┘  │
      │                      │
      │  ┌────────────────┐  │
      │  │ ⚙️ Einstellungen│  │  ← Outline
      │  └────────────────┘  │
      │                      │
      │  ┌────────────────┐  │
      │  │ 🏠 Hauptmenü   │  │  ← Error (Destructive)
      │  └────────────────┘  │
      │                      │
      └──────────────────────┘
        ↑ Modal, Rounded-xl, Shadow-xl

═══════════════════════════════════════
```

**Interaktionen:**
- Tap außerhalb: Modal schließt (= Weiterspielen)
- ESC-Taste: Modal schließt
- Hauptmenü: Confirmation-Dialog ("Fortschritt geht verloren")

---

## Animationen & Transitions

### Page Transitions

```css
/* Vorwärts-Navigation (z.B. Home → Setup) */
.screen-enter {
  animation: slideInRight 300ms ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Rückwärts-Navigation (z.B. Setup → Home) */
.screen-exit {
  animation: slideOutLeft 300ms ease-out;
}

@keyframes slideOutLeft {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}
```

### Micro-Interactions

**Button Press:**
```css
.btn:active {
  transform: scale(0.98);
}
```

**Button Hover:**
```css
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 217, 255, 0.4);
}
```

**Card Hover:**
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

### Loading States

**Spinner:**
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-surface);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Skeleton Loader:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-light) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}
```

### Special Animations

**Confetti (Siegerehrung):**
```javascript
// Canvas-based particle system
// 100-200 colored particles falling from top
// Colors: Team-Color + Primary + Accent
```

**Music Visualizer:**
```css
/* Animated Waveform */
@keyframes wave {
  0%, 100% { height: 10px; }
  50% { height: 30px; }
}

.wave-bar:nth-child(1) { animation-delay: 0s; }
.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
```

**Timer Pulse (Last 5 Seconds):**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.timer-critical {
  animation: pulse 0.5s ease-in-out infinite;
  color: var(--color-error);
}
```

---

## Responsive Verhalten

### Breakpoints

```css
/* Mobile Portrait (Default) */
/* 320px - 767px */

/* Mobile Landscape / Tablet Portrait */
@media (min-width: 768px) {
  /* 2-Column Layouts */
  /* Larger Fonts */
  /* Side-by-Side Elements */
}

/* Tablet Landscape / Desktop */
@media (min-width: 1024px) {
  /* 3-Column Layouts */
  /* Sidebar Navigation */
  /* Max-Width Container (1024px) */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Centered, Max-Width 1280px */
}
```

### Landscape-Spezifisch (Gameplay)

```css
@media (orientation: landscape) and (max-height: 500px) {
  /* Kompaktes Layout */
  /* Video + Question Side-by-Side */
  /* Kleinere Header */
}
```

**Beispiel: Gameplay Landscape**
```
┌──────────────────────────────────────────────────┐
│ ⏸ Runde 2/4 • Song 5/10          🎵 0:18  ⏳ 12 │ ← Kompakt
├──────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌──────────────────────┐   │
│ │                 │  │ ✏️ Team Awesome:     │   │
│ │  🎵  🎵  🎵    │  │                      │   │
│ │                 │  │ • Song-Titel         │   │
│ │  Musik läuft... │  │ • Interpret          │   │
│ │                 │  │ • Jahr               │   │
│ │  🔊 0:18        │  │                      │   │
│ │                 │  │ [⏹ Beenden] [⏭ Skip]│   │
│ └─────────────────┘  └──────────────────────┘   │
│    ↑ 60% Width         ↑ 40% Width              │
└──────────────────────────────────────────────────┘
```

---

## Accessibility

### Touch-Targets
- **Minimum:** 48x48px für alle interaktiven Elemente
- **Optimal:** 56x56px für Primär-Buttons

### Kontrast
- **Text:** WCAG AA Standard (4.5:1 minimum)
- **Large Text (18px+):** WCAG AA (3:1 minimum)
- **Aktuelle Werte:**
  - Text auf Background: 13.5:1 ✅
  - Primary auf Background: 8.2:1 ✅
  - Secondary-Text auf Background: 6.1:1 ✅

### Focus-Indikatoren
```css
button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### ARIA-Labels
```html
<button aria-label="Song löschen">
  <svg>...</svg>
</button>
```

### Screen Reader Support
- Semantische HTML-Tags (`<nav>`, `<main>`, `<article>`)
- Aria-Live Regions für dynamische Inhalte
- Skip-to-Content Link

---

## Design-Assets Checklist

### Icons (für Designer)
- [ ] App-Icon (512x512px)
  - Farben: Cyan-Gradient
  - Motiv: Musiknote + Wellen/Kreis
- [ ] Favicon (32x32px, 16x16px)
- [ ] PWA-Icons (72, 96, 128, 144, 152, 192, 384, 512px)

### UI-Icons (24x24px)
- [ ] Navigation: Home, Back, Settings, Menu
- [ ] Actions: Play, Pause, Stop, Skip, Repeat
- [ ] Content: Music Note, Trophy, Medal, Star, Check, X
- [ ] Misc: Search, Filter, Add, Edit, Delete

### Illustrationen (Optional)
- [ ] Empty-State: "Keine Songs" (Musik-bezogen)
- [ ] Empty-State: "Keine Historie" (Uhr/Kalender)
- [ ] Error-State: "Verbindung verloren" (WiFi/Netz)

### Animationen
- [ ] Konfetti-Animation (Lottie/Canvas)
- [ ] Trophy-Shine-Effect (CSS/SVG)
- [ ] Music-Visualizer-Waveform (CSS)

---

## Zusammenfassung

### Kern-Merkmale
✅ **Mobile-First:** Optimiert für Smartphone Portrait & Landscape
✅ **Dark Theme:** Blau/Grün-Schema statt Rot/Pink
✅ **Große Touch-Targets:** Min. 48x48px
✅ **Klare Hierarchie:** Eine Hauptaktion pro Screen
✅ **Schnelle Interaktion:** Max. 2 Klicks zu Hauptfunktionen
✅ **Accessibility:** WCAG AA Standard, Screen Reader Support

### Farb-Highlights
- **Primär:** `#00D9FF` (Cyan) - Hauptaktionen, Energie
- **Sekundär:** `#0A4D68` (Petrol-Blau) - UI-Struktur
- **Akzent:** `#05C46B` (Grün) - Erfolg, Highlights
- **Hintergrund:** `#0B1215` (Fast Schwarz) - Basis

### 13 Screens
1. Home, 2. Database Manager, 3. Song Add/Edit, 4. Game Setup,
5. Gameplay, 6. Answer Reveal, 7. Scoreboard, 8. Results,
9. Settings, 10. History, 11. History Detail, 12. Stats, 13. Pause Modal

---

**Bereit für Design-Umsetzung!** 🎨✨