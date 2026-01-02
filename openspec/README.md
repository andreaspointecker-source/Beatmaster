# OpenSpec for BeatMaster

This directory contains all OpenSpec specifications and change proposals for the BeatMaster project.

## Quick Start

### For AI Assistants
Read `AGENTS.md` first for workflow instructions and project-specific guidelines.

### For Developers

**View active changes:**
```bash
openspec list
openspec view
```

**Create a new change proposal:**
```bash
# In your AI chat:
"Create an OpenSpec change proposal for adding [feature name]"

# Or use slash command (Claude Code):
/openspec:proposal [feature-name]
```

**Validate a change:**
```bash
openspec validate [change-name]
openspec show [change-name]
```

**Implement a change:**
```bash
# In your AI chat:
"The specs look good. Let's implement [change-name]."

# Or use slash command (Claude Code):
/openspec:apply [change-name]
```

**Archive completed change:**
```bash
openspec archive [change-name] --yes
```

## Directory Structure

```
openspec/
├── specs/              # Current specifications (source of truth)
│   ├── foundation/     # Core infrastructure (State, Storage, Router)
│   └── song-database/  # Song management system
├── changes/            # Active change proposals
│   └── [feature-name]/
│       ├── proposal.md
│       ├── tasks.md
│       ├── design.md
│       └── specs/
├── archive/            # Completed changes
├── project.md          # Project context and conventions
├── AGENTS.md           # AI assistant instructions
└── README.md           # This file
```

## Current Specifications

### ✅ Foundation (Phase 1)
- State Management (Observable pattern)
- LocalStorage Abstraction
- SPA Router (Hash-based)
- Notification & Modal Systems
- Utility Functions
- CSS Framework
- Home Screen

**Status:** Completed

### 🔄 Song Database (Phase 2)
- Song CRUD Operations
- Search & Filter
- Import/Export JSON
- YouTube ID Validation
- Database Manager UI
- Default Songs Collection

**Status:** Next to implement

## Workflow Example

### 1. Create Proposal
```
User: "Create an OpenSpec proposal for adding YouTube integration"
```

AI creates:
```
openspec/changes/youtube-integration/
├── proposal.md      # Why and what
├── tasks.md         # Implementation steps
├── design.md        # Technical decisions
└── specs/youtube/
    └── spec.md      # Delta (ADDED/MODIFIED/REMOVED requirements)
```

### 2. Review Specs
```bash
openspec show youtube-integration
```

Iterate with AI to refine specs, add scenarios, clarify requirements.

### 3. Implement
```
User: "The specs look good. Let's implement this."
```

AI works through `tasks.md` systematically.

### 4. Archive
```bash
openspec archive youtube-integration --yes
```

Specs merged to `openspec/specs/youtube/`, change folder moved to archive.

## Best Practices

### When to Use OpenSpec

**DO create proposals for:**
- New features (Spotify integration, multiplayer mode)
- Significant refactors (migrate to IndexedDB)
- Algorithm changes (improve fuzzy matching)
- New screens or major UI changes
- Data schema modifications

**DON'T create proposals for:**
- Bug fixes (typos, obvious errors)
- CSS tweaks
- Documentation updates
- Debug logging

### Writing Good Requirements

**Use RFC 2119 keywords:**
- SHALL/MUST = mandatory
- SHOULD = recommended
- MAY = optional
- SHALL NOT/MUST NOT = prohibited

**Include scenarios:**
Every requirement needs at least:
- One happy-path scenario
- Edge cases (if applicable)
- Error handling (if applicable)

**Example:**
```markdown
### Requirement: Answer Validation
The system SHALL use fuzzy matching with 80% similarity.

#### Scenario: Typo accepted
- GIVEN correct answer is "Bohemian Rhapsody"
- WHEN user submits "Bohemian Rapsody"
- THEN answer SHALL be accepted as correct
```

## CLI Commands

```bash
# List active changes
openspec list

# Interactive dashboard
openspec view

# Show change details
openspec show <change-name>

# Validate spec format
openspec validate <change-name>

# Archive change (merge to specs/)
openspec archive <change-name> --yes

# Update agent instructions
openspec update

# Check version
openspec --version
```

## Custom Commands (Claude Code)

If using Claude Code, you have slash commands:

- `/openspec:proposal <name>` - Create change proposal
- `/openspec:apply <name>` - Implement approved change
- `/openspec:archive <name>` - Archive completed change

## Resources

- **OpenSpec Docs:** https://github.com/Fission-AI/OpenSpec
- **Project Context:** `openspec/project.md`
- **Agent Instructions:** `openspec/AGENTS.md`
- **Implementation Plan:** `docs/implementation-plan.md`
- **UI Design Spec:** `docs/ui-design-spec.md`

## Development Phases

- ✅ Phase 1: Foundation
- 🔄 Phase 2: Song Database (current)
- ⏳ Phase 3: YouTube Integration
- ⏳ Phase 4: Game Engine
- ⏳ Phase 5: Game UI
- ⏳ Phase 6: Polish
- ⏳ Phase 7: PWA & Deployment

---

**Questions?** Ask in chat or refer to `AGENTS.md` for detailed guidelines.
