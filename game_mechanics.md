# Game Mechanics: Beatmaster App

## 1. Spielvorbereitung (Pre-Game Setup)
Vor jedem Spiel werden die Rahmenbedingungen festgelegt:
*   **Spieler/Teams:** Unbegrenzte Anzahl von Spielern/Teams kann hinzugefügt werden.
*   **Song-Filter:** Auswahl der Songs basierend auf Kriterien wie Genre, Dekade, etc.
*   **Timer-Einstellungen:** Dauer der Vorlauf- und Nachlauf-Timer (Standard: 5 Sekunden).

## 2. Der Rundenablauf (Core Game Loop)
Die App fungiert als Game-Master und führt durch die folgenden Phasen:

### Phase 1: "Karten mischen" (Mischen)
*   **Visuell:** Animation von mischenden Karten.
*   **Audio:** Passender Misch-Sound.
*   **Dauer:** ca. 5 Sekunden.

### Phase 2: "Timer vor der Musik" (Get Ready)
*   **Visuell:** Ein Countdown (Zahlen, die herunterzählen).
*   **Dauer:** Standardmäßig 5 Sekunden (in den Einstellungen anpassbar).

### Phase 3: "Musik" (Ratephase)
*   **Aktion:** Ein zufälliger Song aus der gefilterten Playlist wird verdeckt abgespielt.
*   **Visuell:** Animierte Schallplatte mit Lichteffekten (dreht sich).
*   **Fortschritt:** Ein Kreis um die Schallplatte füllt sich bis zum Ende des Liedes (oder Ausschnitts).

### Phase 4: "Timer nach der Musik" (Letzte Chance)
*   **Visuell:** Ein weiterer Countdown.
*   **Dauer:** Standardmäßig 5 Sekunden (in den Einstellungen anpassbar).
*   **Audio:** Am Ende des Timers ertönt eine freundliche Voice-Line, die verkündet, dass die Runde zu Ende ist.

### Phase 5: "Auflösung" (Scoring)
*   **Visuell:** Enthüllung aller Informationen zum Song (Titel, Interpret, Cover).
*   **Monetarisierung:** Eleganter Affiliate-Link/Button zu Apple Music für diesen Song.
*   **Interaktion (Scoring):** Der Game-Master/User vergibt hier die Punkte an die Spieler.
*   **Punkte-System:** Es gibt nur "Richtig" oder "Falsch" pro Spieler/Team.

## 3. Zukünftige Erweiterungen
*   **Online-Modus:** Später soll ein Online-Modus hinzugefügt werden, bei dem Spieler die Antworten über eine eigene Texteingabe auf ihren Geräten eintippen.
