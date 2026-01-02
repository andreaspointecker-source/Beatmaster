# Change Proposal: Extended Game Mode

## Metadata
- **Change ID:** extended-game-mode
- **Type:** Feature Enhancement
- **Status:** Proposed
- **Created:** 2026-01-02
- **Author:** BeatMaster Team
- **Affects:** Game Setup, Gameplay Flow, Scoring System
- **Priority:** High
- **Estimated Complexity:** Medium-High

## Executive Summary

This change proposal introduces an **extended game mode** for BeatMaster that enhances the core gameplay experience with:

1. **Advanced Game Setup Options** - Configurable question types, genre grouping, decade filtering, and song duration
2. **Immersive Question Selection** - Card shuffle animation for random question selection
3. **Enhanced Playback Experience** - Vinyl record animation with preparation and end timers
4. **Manual Scoring System** - Checkbox-based point assignment per team with song info reveal

## Motivation

### Problem Statement

The current game setup (`js/screens/game-setup.js`) only allows:
- Team configuration (names and colors)
- Number of rounds
- Game mode selection (only "Classic" shown)

This is insufficient for creating varied gameplay experiences. Players want:
- Control over which question types appear (not all teams enjoy year/decade questions)
- Genre filtering (e.g., "Rock night" or "80s party")
- Customizable song duration (longer for easy songs, shorter for challenges)
- Better visual feedback during gameplay
- Flexibility in scoring (manual verification for disputed answers)

### Use Cases

**Use Case 1: 80s Rock Party**
- Users want only Rock/Alternative genres from the 1980s
- Question types: Song Title and Artist only (no year questions)
- Song duration: 45 seconds (longer to enjoy classics)
- 4 teams competing

**Use Case 2: Quick Speed Round**
- All genres and decades enabled
- All question types active
- Song duration: 15 seconds (fast-paced)
- 2 teams, 20 rounds

**Use Case 3: Themed Event**
- Only Pop and Dance genres
- Decades: 2000s and 2010s
- Manual scoring to handle disputed answers
- Video replay to verify

## Goals

### Primary Goals
1. Enable comprehensive game configuration before starting
2. Provide engaging visual animations during gameplay
3. Implement manual scoring system with transparency
4. Maintain mobile-first responsive design

### Secondary Goals
- Improve UX with smooth animations and transitions
- Support theme customization per game session
- Track genre/decade preferences for future auto-suggestions

### Non-Goals
- Automatic answer validation (stays manual for MVP)
- Voice input for answers
- Multiplayer networking (local play only)
- Integration with external music services (YouTube only)

## Proposed Changes

### 1. Game Setup Enhancements

**Current Behavior:**
```javascript
// game-setup.js only configures:
- teams (name, color)
- rounds (1-50)
- mode (always 'classic')
```

**New Behavior:**
```javascript
// Extended configuration includes:
- teams (name, color)
- rounds (1-50)
- questionTypes (array of enabled types)
- genreGroups (grouped genres with enable/disable)
- decades (1970s, 1980s, etc. with enable/disable)
- songDuration (15-90 seconds)
```

### 2. Question Selection Animation

**Implementation:**
- Card shuffle animation (2 seconds)
- Visual: 5 cards shuffling, 1 card drawn
- Question revealed on selected card
- CSS-based animation (no external libraries)

### 3. Playback Flow with Timers

**New Sequence:**
1. **Preparation Phase** (5 seconds)
   - Countdown: 5, 4, 3, 2, 1
   - Display: "Macht euch bereit!"
   - Sound: Beep on each tick

2. **Playback Phase** (configurable duration)
   - YouTube video hidden completely
   - Vinyl record animation overlay
   - Rotation: 33.3 RPM (1.8s per rotation)
   - Audio plays normally

3. **End Phase** (5 seconds)
   - Countdown: 5, 4, 3, 2, 1
   - Display: "Runde zu Ende!"
   - Sound: Signal tone at end

4. **Reveal Phase**
   - Show song information (title, artist, year, genre, album)
   - Show album cover if available
   - Offer "Watch Full Video" button
   - Manual scoring UI

### 4. Manual Scoring System

**Features:**
- Checkbox for each team (✓ = correct answer)
- Display current team scores
- Locked "Next Round" button until at least one checkbox is checked
- Visual feedback on score changes
- Persistent score tracking

## Impact Analysis

### User Impact
- **Positive:** More control over gameplay, better visual experience
- **Learning Curve:** Minimal - UI follows established patterns
- **Accessibility:** All animations can be disabled via settings (future)

### Technical Impact
- **New Files:** 4-5 new modules (animators, timers, scoring)
- **Modified Files:** `game-setup.js`, `gameplay.js`, `config.js`
- **Database:** No schema changes (uses existing song fields)
- **Performance:** Minimal - CSS animations are GPU-accelerated

### Dependencies
- **Existing:** YouTube IFrame API, State Management, Storage Module
- **New:** No external dependencies (vanilla JS/CSS)

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex animations on low-end devices | Medium | Medium | Provide option to disable animations |
| Timer drift on long games | Low | Low | Use timestamp-based timers |
| Manual scoring disputes | Medium | Low | Add optional answer hints |
| Genre grouping confusion | Low | Medium | Clear UI labels and tooltips |

## Alternatives Considered

### Alternative 1: Automatic Answer Validation
**Pros:** Faster gameplay, no disputes
**Cons:** Requires fuzzy matching, can frustrate users with "close enough" answers
**Decision:** Rejected for MVP - manual scoring is more flexible

### Alternative 2: Pre-defined Game Modes
**Pros:** Simpler UI, faster setup
**Cons:** Less flexible, users want custom combinations
**Decision:** Keep for future (add "Quick Setup" presets later)

### Alternative 3: Playlist-based Genre Selection
**Pros:** Reusable configurations
**Cons:** Adds complexity, not needed for MVP
**Decision:** Postponed to Phase 6

## Success Metrics

### Quantitative
- Users create custom configurations in >50% of games
- Average game setup time remains <90 seconds
- Manual scoring disputes <10% of rounds
- Animation frame rate stays >30 FPS on target devices

### Qualitative
- Users report gameplay as "engaging" and "visually appealing"
- Setup process is "intuitive" and "flexible"
- Scoring system is "fair" and "transparent"

## Timeline & Milestones

### Phase 1: Game Setup UI (3-4 hours)
- [ ] Extend CONFIG.GAME with new options
- [ ] Update GameSetupScreen UI
- [ ] Add question type checkboxes
- [ ] Add genre grouping UI
- [ ] Add decade filters
- [ ] Add song duration slider
- [ ] Update validation logic

### Phase 2: Animations (2-3 hours)
- [ ] Create QuestionAnimator module
- [ ] Implement card shuffle CSS animation
- [ ] Create VinylAnimator module
- [ ] Implement vinyl record rotation
- [ ] Create CountdownTimer module
- [ ] Add sound effects

### Phase 3: Playback Flow (3-4 hours)
- [ ] Update GameplayScreen
- [ ] Integrate preparation countdown
- [ ] Add vinyl overlay during playback
- [ ] Integrate end countdown
- [ ] Handle phase transitions

### Phase 4: Reveal & Scoring (2-3 hours)
- [ ] Create RoundRevealScreen
- [ ] Display song information
- [ ] Add video replay button
- [ ] Implement manual scoring UI
- [ ] Update game state with scores

### Phase 5: Integration & Testing (2-3 hours)
- [ ] Connect all components
- [ ] Test full game flow
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Bug fixes

**Total Estimated Time:** 12-17 hours

## Open Questions

1. **Genre Grouping Strategy**
   - Should "Rock" auto-include "Classic Rock" and "Alternative Rock"?
   - **Proposed:** Create predefined groups but allow custom editing

2. **Song Duration Limits**
   - Current range: 15-90 seconds. Is this sufficient?
   - **Proposed:** Keep range, most songs are 30-45 seconds

3. **Scoring Points per Question Type**
   - Should different question types award different points?
   - **Proposed:** Yes, use existing CONFIG.GAME.questionWeights

4. **Animation Performance on Old Devices**
   - Should we detect performance and disable animations?
   - **Proposed:** Add manual toggle in settings (Phase 6)

5. **Vinyl Record Asset**
   - Use SVG or PNG for vinyl record image?
   - **Proposed:** SVG for scalability and small file size

## Approval Required From

- [x] Product Owner (self-approved - solo project)
- [ ] Technical Lead (pending review)
- [ ] UX Designer (pending review)

## Related Documents

- [Implementation Plan](../../docs/implementation-plan.md)
- [UI Design Spec](../../docs/ui-design-spec.md)
- [Game Mode API Spec](../../docs/game-mode-spec.yaml)
- [Foundation Spec](../../specs/foundation/spec.md)
- [Song Database Spec](../../specs/song-database/spec.md)

## Rollback Plan

If critical issues arise during implementation:

1. **Partial Rollback:** Keep setup enhancements, disable animations
2. **Full Rollback:** Revert to basic game setup, maintain existing gameplay
3. **Data Safety:** All changes are additive - existing game states remain compatible

## Notes

- This change builds on completed Phase 1 (Foundation) and Phase 2 (Song Database)
- Aligns with project goal of creating engaging party game experience
- Follows existing patterns: Observable State, Screen Controllers, Mobile-First
- No breaking changes to existing APIs or data schemas
