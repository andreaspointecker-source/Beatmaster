# OpenSpec Quick Start für BeatMaster

## Was ist OpenSpec?

OpenSpec ist ein Framework für **Spec-driven Development (SDD)** - du definierst erst, WAS gebaut werden soll, bevor du mit dem Code beginnst. Das hilft dir und deinen KI-Assistenten, auf dem gleichen Stand zu bleiben.

## Installation ✅

OpenSpec ist bereits installiert und konfiguriert!

```bash
openspec --version  # Sollte 0.17.2 oder höher zeigen
```

## Projektstruktur

```
BeatMaster/
├── openspec/
│   ├── specs/              # ✅ Aktuelle Spezifikationen (Source of Truth)
│   │   ├── foundation/     # Phase 1 - Fertig
│   │   └── song-database/  # Phase 2 - Bereit zur Implementierung
│   ├── changes/            # 📝 Vorgeschlagene Änderungen (noch leer)
│   ├── archive/            # 📦 Abgeschlossene Änderungen
│   ├── project.md          # 📖 Projekt-Kontext & Konventionen
│   ├── AGENTS.md           # 🤖 KI-Assistent Anweisungen
│   └── README.md           # 📚 Vollständige OpenSpec-Dokumentation
└── docs/
    ├── implementation-plan.md   # Detaillierter 7-Phasen-Plan
    └── ui-design-spec.md        # UI/UX Design mit Blau/Grün-Schema
```

## Dein Workflow

### 1️⃣ Neue Funktion planen

Sag deinem KI-Assistenten:
```
"Create an OpenSpec change proposal for adding [Feature-Name]"
```

Zum Beispiel:
```
"Create an OpenSpec change proposal for adding Spotify integration"
```

Der Assistent erstellt automatisch:
```
openspec/changes/spotify-integration/
├── proposal.md      # Warum und was sich ändert
├── tasks.md         # Implementierungs-Checkliste
├── design.md        # Technische Entscheidungen
└── specs/
    └── spotify/
        └── spec.md  # Neue/geänderte Requirements
```

### 2️⃣ Spezifikation prüfen

```bash
# Alle aktiven Changes anzeigen
openspec list

# Details eines Changes anzeigen
openspec show spotify-integration

# Format validieren
openspec validate spotify-integration
```

### 3️⃣ Specs verfeinern

Chatte mit deinem KI-Assistenten:
```
"Add more scenarios for error handling"
"What happens when the Spotify API is down?"
"Add acceptance criteria for offline mode"
```

### 4️⃣ Implementierung starten

Wenn die Specs gut aussehen:
```
"The specs look good. Let's implement spotify-integration."
```

Der Assistent arbeitet die Tasks aus `tasks.md` ab.

### 5️⃣ Change abschließen

Wenn fertig und getestet:
```bash
openspec archive spotify-integration --yes
```

Das:
- Mergt die Specs nach `openspec/specs/spotify/`
- Verschiebt den Change-Ordner nach `openspec/archive/`
- Die neue Spec wird zur Source of Truth

## Custom Commands (Claude Code)

Du kannst auch Slash-Commands verwenden:

```
/openspec:proposal spotify-integration
/openspec:apply spotify-integration
/openspec:archive spotify-integration
```

## Nächster Schritt: Phase 2 implementieren

Du bist bereit, **Phase 2: Song-Datenbank** zu implementieren!

Die Spezifikation ist bereits fertig: `openspec/specs/song-database/spec.md`

### So startest du:

1. **Erstelle einen Change-Proposal:**
   ```
   "Create an OpenSpec change proposal for implementing the song database"
   ```

2. **Oder implementiere direkt** (da die Spec schon in `openspec/specs/` ist):
   ```
   "Let's implement the song database according to openspec/specs/song-database/spec.md"
   ```

Der Assistent wird:
- `js/modules/database.js` implementieren (CRUD, Search, Filter)
- `js/screens/database-manager.js` implementieren (UI)
- `data/default-songs.json` mit 50+ Songs erstellen
- Alles testen und validieren

## Wichtige Konzepte

### Requirements Format

```markdown
### Requirement: [Name]
The system SHALL/MUST [requirement text].

#### Scenario: [Scenario name]
- WHEN [condition]
- THEN [expected outcome]
```

### RFC 2119 Keywords

- **SHALL/MUST** = Pflicht
- **SHOULD** = Empfohlen
- **MAY** = Optional
- **SHALL NOT/MUST NOT** = Verboten

### Delta Format (für Changes)

```markdown
# Delta for [Feature]

## ADDED Requirements
[Neue Requirements]

## MODIFIED Requirements
[Geänderte Requirements - vollständiger Text]

## REMOVED Requirements
[Entfernte Requirements]
```

## Hilfreiche Kommandos

```bash
# Übersicht aller Changes
openspec list

# Interaktives Dashboard
openspec view

# Change-Details
openspec show <change-name>

# Validierung
openspec validate <change-name>

# Archivieren
openspec archive <change-name> --yes

# Version
openspec --version
```

## Resourcen

- **OpenSpec Docs:** https://github.com/Fission-AI/OpenSpec
- **Projekt-Kontext:** [openspec/project.md](openspec/project.md)
- **Agent-Instructions:** [openspec/AGENTS.md](openspec/AGENTS.md)
- **Vollständige Docs:** [openspec/README.md](openspec/README.md)
- **Implementierungsplan:** [docs/implementation-plan.md](docs/implementation-plan.md)
- **UI-Design:** [docs/ui-design-spec.md](docs/ui-design-spec.md)

## FAQ

**Q: Muss ich für jede kleine Änderung einen Change erstellen?**
A: Nein! Nur für Features, Refactorings, neue Screens. Bug-Fixes und CSS-Tweaks brauchen keinen Change.

**Q: Was passiert mit archivierten Changes?**
A: Sie bleiben in `openspec/archive/` als Dokumentation und die Specs werden in `openspec/specs/` gemergt.

**Q: Kann ich bestehende Specs ändern?**
A: Ja, erstelle einen Change mit MODIFIED Requirements im Delta.

**Q: Wie arbeite ich mit einem Team?**
A: Jeder kann eigene KI-Tools nutzen, aber alle arbeiten mit denselben Specs aus `openspec/specs/`.

---

**Viel Erfolg mit BeatMaster! 🎵🎉**

Bei Fragen: Schau in `openspec/README.md` oder frag deinen KI-Assistenten!
