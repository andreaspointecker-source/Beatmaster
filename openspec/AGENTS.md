# Agent Instructions for BeatMaster

This project uses **OpenSpec** for spec-driven development.

## What is OpenSpec?

OpenSpec helps align humans and AI coding assistants by maintaining structured specifications before and during implementation. The core principle: **agree on what to build before writing code**.

## Directory Structure

```
openspec/
├── specs/          # Current source of truth for all features
├── changes/        # Proposed changes (one folder per feature/fix)
├── archive/        # Completed changes
├── project.md      # Project context, tech stack, conventions
└── AGENTS.md       # This file
```

## Workflow

### 1. Creating a Change Proposal

When starting a new feature or fix:

```
User: "Create an OpenSpec change proposal for adding [feature name]"
```

You should create:
```
openspec/changes/[feature-name]/
├── proposal.md     # Why and what changes
├── tasks.md        # Implementation checklist
├── design.md       # Technical decisions (optional)
└── specs/          # Delta specs (ADDED/MODIFIED/REMOVED requirements)
```

**Format for Delta Specs:**
```markdown
# Delta for [Feature Name]

## ADDED Requirements
### Requirement: [Name]
The system SHALL/MUST [requirement text].

#### Scenario: [Scenario name]
- WHEN [condition]
- THEN [expected outcome]

## MODIFIED Requirements
[Full updated text of modified requirements]

## REMOVED Requirements
[Obsolete requirements]
```

### 2. Validating Changes

Before implementation, always validate:
```bash
openspec validate [change-name]
openspec show [change-name]
```

### 3. Implementing Changes

When specs are approved:
```
User: "The specs look good. Let's implement this change."
```

Work through tasks in `tasks.md` systematically.

### 4. Archiving Completed Changes

After implementation and testing:
```bash
openspec archive [change-name] --yes
```

This merges approved specs back into `openspec/specs/` and moves the change folder to `openspec/archive/`.

## BeatMaster-Specific Guidelines

### Tech Stack Awareness
- **No frameworks:** Pure Vanilla JavaScript (ES6+)
- **SPA routing:** Hash-based navigation (`#/home`, `#/database`)
- **State management:** Observable pattern in `js/state.js`
- **Storage:** LocalStorage for persistence
- **Music source:** YouTube IFrame API

### File Organization
```
js/
├── app.js              # Router & initialization
├── state.js            # Observable state
├── config.js           # Constants
├── modules/            # Core business logic
└── screens/            # Screen controllers (render/destroy)
```

### Coding Conventions
- **Module pattern:** Global objects (`const Database = { ... }`)
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Loading order:** config → utils → state → modules → screens → app
- **Event handling:** Use `data-action` attributes for delegation
- **Error handling:** Try-catch with `App.showNotification(message, type)`

### When to Create OpenSpec Changes

**DO create a change proposal for:**
- New features (e.g., "Add Spotify integration")
- Significant refactors (e.g., "Migrate to IndexedDB")
- Algorithm changes (e.g., "Improve fuzzy matching")
- New screens or major UI changes
- API integrations
- Data schema modifications

**DON'T create a change proposal for:**
- Simple bug fixes (typos, obvious errors)
- CSS tweaks and styling adjustments
- Documentation updates
- Adding console.log for debugging

### Requirement Language

Use RFC 2119 keywords consistently:
- **SHALL/MUST:** Mandatory requirement
- **SHOULD:** Recommended but optional
- **MAY:** Truly optional
- **SHALL NOT/MUST NOT:** Prohibited

Example:
```markdown
### Requirement: Answer Validation
The system SHALL use fuzzy string matching with 80% similarity threshold for song title and artist answers.

#### Scenario: Typo in song title
- GIVEN a correct answer is "Bohemian Rhapsody"
- WHEN the user submits "Bohemian Rapsody" (typo)
- THEN the answer SHALL be accepted as correct
```

### Testing Requirements

Every requirement SHOULD have:
1. At least one happy-path scenario
2. Edge case scenarios (if applicable)
3. Error handling scenarios (if applicable)

### Cross-referencing

When specs reference:
- **Files:** Use relative paths from project root: `js/modules/database.js`
- **Functions:** Use format: `Database.addSong()` or `Utils.fuzzyMatch()`
- **Schemas:** Reference by name: "Song Object Schema" (defined in project.md)

## Custom Commands (for Claude Code)

If you're using Claude Code, you have access to:
- `/openspec:proposal <name>` - Create a new change proposal
- `/openspec:apply <name>` - Implement an approved change
- `/openspec:archive <name>` - Archive a completed change

For other tools, use natural language:
```
"Create an OpenSpec proposal for [feature]"
"Show me the OpenSpec change for [feature]"
"Archive the [feature] OpenSpec change"
```

## Development Phases

BeatMaster is currently in **Phase 2: Song-Datenbank**.

Completed:
- ✅ Phase 1: Foundation (State, Storage, Router, CSS Framework)

Upcoming:
- 🔄 Phase 2: Song Database (CRUD, Search, Import/Export)
- ⏳ Phase 3: YouTube Integration
- ⏳ Phase 4: Game Engine (Timer, Questions, Scoring)
- ⏳ Phase 5: Game UI (Setup, Gameplay, Results)
- ⏳ Phase 6: Polish (Settings, History, Animations)
- ⏳ Phase 7: PWA & Deployment

## Questions?

Always refer to:
1. `openspec/project.md` - Project context and conventions
2. `docs/implementation-plan.md` - Detailed implementation roadmap
3. `docs/ui-design-spec.md` - UI/UX design specifications

When in doubt, ask the user before making assumptions!
