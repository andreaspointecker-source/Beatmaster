# Design System: Beatmaster App

## 1. Allgemeine Übersicht
*   **Thema:** Dark Mode, modern, elegant, musikzentriert.
*   **Stil:** Neumorphismus-Einflüsse (subtile Schatten und Ränder), hohe Kontraste durch leuchtende Akzentfarben auf dunklem Grund.
*   **Formensprache:** Abgerundete Ecken (Pill-Shapes für Hauptbuttons, abgerundete Rechtecke für Karten und Inputs).

## 2. Farbpalette

### Hintergrund & Flächen (Dark Navy / Slate Theme)
*   **App-Hintergrund (Global):** `#111625` bis `#1A2235` (Leichter, radialer Verlauf von oben nach unten).
*   **Karten- & Panel-Hintergrund:** `#1E2638` (Etwas heller als der App-Hintergrund, um Tiefe zu erzeugen).
*   **Subtile Ränder (Borders):** `#2A354D` (Für inaktive Buttons, Eingabefelder und Container).

### Akzentfarben (Gradient & Highlights)
*   **Primärer Akzent-Verlauf (Primary Gradient):** Von Orange `#FF7A00` (links/unten) nach Gelb-Orange `#FFB300` (rechts/oben).
*   **Indikator-Punkte & Aktive Rahmen:** `#FF8C00` (Klares Orange).

### Typografie-Farben
*   **Primärer Text (Überschriften, aktiver Text):** `#FFFFFF` (Reines Weiß).
*   **Sekundärer Text (Untertitel, Platzhalter, inaktiver Text):** `#8E9BB0` (Kühles Blaugrau).
*   **Text auf Primär-Buttons:** `#111625` (Dunkles Navy).
*   **Logo-Text & Highlight-Text:** Akzent-Verlauf (Orange zu Gelb) oder massives `#FFB300`.

## 3. Typografie
*   **Schriftart (Font-Family):** Moderne Sans-Serif Schrift (z.B. Inter, Roboto, San Francisco).
*   **Hierarchie:**
    *   **Logo/App-Titel:** Uppercase, Bold, ca. 32-36px.
    *   **Überschriften (H1):** Bold, ca. 24-28px, Weiß.
    *   **Sub-Header / Label:** Uppercase, Medium/Semibold, ca. 12-14px, weites Kerning (Sekundärfarbe).
    *   **Body Text:** Regular, ca. 14-16px, Sekundärfarbe.
    *   **Button Text:** Uppercase, Bold, ca. 16px, weites Kerning.

## 4. UI-Komponenten

### Buttons
*   **Primary Button (z.B. "NEUES SPIEL", "WEITER"):**
    *   Form: "Pill-Shape" (`border-radius: 50px`).
    *   Hintergrund: Primärer Akzent-Verlauf.
    *   Schatten: Subtiler, farbiger Glow-Effekt.
    *   Text: Dunkel (`#111625`), Uppercase, Bold.
*   **Secondary Button (z.B. "Einstellungen", "Zurück"):**
    *   Form: Pill-Shape (`border-radius: 50px`).
    *   Hintergrund: Transparent oder leicht abgedunkelt (`#151B2B`).
    *   Rahmen: 1px Solid `#2A354D`.
    *   Text: Weiß, Regular.

### Interaktion im Spiel (Quiz-Ansicht)
*   **Keine Klick-Antworten:** Im lokalen Standard-Spielablauf gibt es keine anklickbaren Antwort-Buttons. Die App fungiert als Game-Master (Karten mischen -> Timer -> Musik -> Timer -> Auflösung).
*   **Texteingabe (für geplanten Online-Modus):** 
    *   Form: Abgerundetes Rechteck (`border-radius: 12px` oder `16px`).
    *   Hintergrund: `#1A2235`.
    *   Rahmen: 1px Solid `#2A354D`.
    *   Text: Nutzer tippen die Antwort selbstständig per Tastatur ein.

### Fortschrittsringe & Kreis-Elemente
*   Dicke, konzentrische Kreise für den Timer.
*   Hintergrund-Spur: Dunkles Blau (`#151B2B`).
*   Fortschritts-Spur: Primärer Akzent-Verlauf.
*   Zentriertes Element: Runder Button/Icon-Container mit Akzent-Verlauf.

## 5. Layout & Hintergrund-Effekte
*   **Hintergrund-Muster:** Sehr feine, konzentrische Kreise (Linien mit geringer Deckkraft, ca. 5-10% Weiß/Orange), ähnlich wie Schallwellen.
*   **Abstände (Spacing):** Großzügiger Whitespace/Darkspace. Standard-Paddings für Container bei ca. 20px bis 24px an den Bildschirmrändern.
*   **Ausrichtung:** Vertikale Zentrierung für Hauptmenüs, linksbündige Ausrichtung für Formular-Label und Listen.

## 6. Icons
*   Stil: Outline (Linien-Icons), minimalistisch, Strichstärke ca. 1.5px bis 2px.
*   Verwendete Icons: Musiknote, Play-Button, Benutzer, Kalender, Mikrofon, Share-Node, Settings-Slider, Pfeile (Chevron).

## 7. Monetarisierung & Werbeplatzierungen

### Dauerhaftes Banner (Bottom Ad)
*   **Position:** Fixiert am unteren Bildschirmrand (Sticky Bottom), oberhalb der Safe-Area.
*   **Sichtbarkeit:** Über die gesamte Dauer der Runde sichtbar (Karten mischen, Timer, Musik-Preview, Auflösung). Stört den Spielfluss nicht.
*   **Placeholder-Zustand:** Rechteck `320x50pt`, Hintergrundfarbe `#1A2235`.

### Affiliate-Integration (Apple Music)
*   **Position:** Nur bei der Auflösung der Runde sichtbar.
*   **Funktion:** Ein visueller Link/Button ("Auf Apple Music ansehen/kaufen"), um den Song direkt zu erwerben.

### Rewarded Video Ads (Freischaltungen)
*   **Position:** Im Menü für die Playlist-/Kategorien-Auswahl.
*   **Funktion:** Spieler können gesperrte Playlisten oder Genres freischalten, indem sie sich freiwillig ein Werbevideo ansehen.
*   **UI-Element:** Gesperrte Kategorien haben ein kleines Video-Icon, das diese Option signalisiert.
