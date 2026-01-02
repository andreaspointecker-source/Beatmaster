# Implementation Tasks: Extended Game Mode

## Overview

This document provides a detailed implementation checklist for the Extended Game Mode feature. Tasks are organized by phase and include acceptance criteria for each item.

**Total Estimated Time:** 12-17 hours
**Status:** Not Started
**Priority:** High

---

## Phase 1: Game Setup UI Enhancement

**Estimated Time:** 3-4 hours
**Dependencies:** None (builds on existing game-setup.js)

### 1.1 Configuration Updates

- [ ] **Task:** Extend CONFIG.GAME in `js/config.js`
  - [ ] Add `QUESTION_TYPES_CONFIG` with labels and descriptions
  - [ ] Add `GENRE_GROUPS` with predefined groupings
  - [ ] Add `DECADES` array (1970s through 2020s)
  - [ ] Add `SONG_DURATION_MIN` and `SONG_DURATION_MAX` constants
  - [ ] Add `DEFAULT_SONG_DURATION` constant
  - **Acceptance Criteria:**
    - All new constants are frozen with `Object.freeze()`
    - Genre groups include: Rock/Alternative, Pop/Dance, Metal, Austropop, German
    - Question types match existing types in CONFIG.GAME.QUESTION_TYPES

### 1.2 Game Setup Screen UI

- [ ] **Task:** Add Question Types Selection
  - [ ] Create checkbox group for question types
  - [ ] Display labels: "Song-Titel", "Interpret", "Jahr", "Genre", "Dekade"
  - [ ] Require at least 1 question type selected
  - [ ] Show validation error if none selected
  - **Acceptance Criteria:**
    - Mobile-friendly checkbox design (min 44x44px touch targets)
    - At least one checkbox must be checked to proceed
    - State persists when navigating away and back

- [ ] **Task:** Add Genre Groups Selection
  - [ ] Create collapsible genre group sections
  - [ ] Add "Alle auswählen" / "Alle abwählen" toggle per group
  - [ ] Display individual genres within each group
  - [ ] Show selected genre count badge
  - **Acceptance Criteria:**
    - Groups are visually distinct (card-based layout)
    - "Select All" toggles all genres in group
    - At least one genre must be selected
    - Genre selection stored in game state

- [ ] **Task:** Add Decades Filter
  - [ ] Create decade checkbox grid (1970s through 2020s)
  - [ ] Add "Alle Dekaden" toggle
  - [ ] Show visual indicator for selected decades
  - [ ] Display selected decade count
  - **Acceptance Criteria:**
    - Responsive grid (2 columns mobile, 3+ desktop)
    - At least one decade must be selected
    - "All Decades" toggle works correctly

- [ ] **Task:** Add Song Duration Slider
  - [ ] Create range slider (15-90 seconds)
  - [ ] Display current value prominently
  - [ ] Show min/max labels
  - [ ] Default to 30 seconds
  - **Acceptance Criteria:**
    - Slider has visual fill to show current position
    - Value updates in real-time as slider moves
    - Accessible keyboard controls (arrow keys)

### 1.3 Validation & State Management

- [ ] **Task:** Update Game State Schema
  - [ ] Add `questionTypes` array to game state
  - [ ] Add `genreFilter` object with enabled genres
  - [ ] Add `decadeFilter` object with enabled decades
  - [ ] Add `songDuration` number field
  - **Acceptance Criteria:**
    - Game state saved to LocalStorage on game start
    - State includes all new configuration options
    - Backwards compatible with existing game states

- [ ] **Task:** Implement Validation Logic
  - [ ] Validate at least 1 question type selected
  - [ ] Validate at least 1 genre selected
  - [ ] Validate at least 1 decade selected
  - [ ] Validate sufficient songs match filters
  - [ ] Show user-friendly error messages
  - **Acceptance Criteria:**
    - Each validation shows specific error message
    - "Start Game" button disabled if validation fails
    - Error messages displayed in notification system

- [ ] **Task:** Update Playlist Generation
  - [ ] Filter songs by selected genres
  - [ ] Filter songs by selected decades
  - [ ] Ensure playlist has enough unique songs
  - [ ] Shuffle and select for game
  - **Acceptance Criteria:**
    - Only songs matching ALL filters are included
    - Minimum songs = totalRounds (error if insufficient)
    - No duplicate songs in playlist

---

## Phase 2: Animation Modules

**Estimated Time:** 2-3 hours
**Dependencies:** Phase 1 (for testing integration)

### 2.1 Question Animation Module

- [ ] **Task:** Create `js/modules/question-animator.js`
  - [ ] Implement card shuffle animation logic
  - [ ] Create Promise-based API for animation completion
  - [ ] Support animation timing configuration
  - **Acceptance Criteria:**
    - Module exports `QuestionAnimator` class
    - `animate(questionText)` returns Promise
    - Animation duration configurable (default 2000ms)

- [ ] **Task:** Create Card Shuffle CSS
  - [ ] Design card visual (front and back)
  - [ ] Implement shuffle animation keyframes
  - [ ] Add card selection animation
  - [ ] Add question reveal transition
  - **Acceptance Criteria:**
    - 5 cards displayed and shuffled
    - Smooth 60 FPS animation
    - Works on mobile and desktop
    - GPU-accelerated (transform/opacity only)

### 2.2 Vinyl Animation Module

- [ ] **Task:** Create `js/modules/vinyl-animator.js`
  - [ ] Implement vinyl overlay component
  - [ ] Create continuous rotation animation
  - [ ] Support start/stop controls
  - **Acceptance Criteria:**
    - Module exports `VinylAnimator` class
    - `show()` and `hide()` methods
    - Rotation speed: 33.3 RPM (1.8s per rotation)

- [ ] **Task:** Create Vinyl Record CSS
  - [ ] Design vinyl record visual (SVG or CSS)
  - [ ] Implement rotation keyframes
  - [ ] Add overlay backdrop (black, z-index above video)
  - **Acceptance Criteria:**
    - Covers YouTube player completely
    - Smooth rotation (GPU-accelerated)
    - Responsive sizing (300px default, scales down)
    - Accessible (can be hidden via settings)

### 2.3 Countdown Timer Module

- [ ] **Task:** Create `js/modules/countdown-timer.js`
  - [ ] Implement timestamp-based countdown
  - [ ] Support tick callbacks
  - [ ] Support completion callback
  - [ ] Add pause/resume functionality
  - **Acceptance Criteria:**
    - Module exports `CountdownTimer` class
    - Constructor: `new CountdownTimer(duration, options)`
    - Methods: `start()`, `pause()`, `resume()`, `stop()`
    - Events: `onTick(secondsRemaining)`, `onComplete()`

- [ ] **Task:** Create Countdown UI Component
  - [ ] Large number display (5, 4, 3, 2, 1)
  - [ ] Pulse animation on each tick
  - [ ] Optional text label
  - [ ] Optional sound effects
  - **Acceptance Criteria:**
    - Numbers are large and readable (min 72px font)
    - Pulse animation is smooth
    - Sound plays on each tick (if enabled)
    - Accessible (aria-live announcements)

### 2.4 Sound Effects

- [ ] **Task:** Add Sound Effect Support
  - [ ] Create `assets/sounds/` directory
  - [ ] Add beep sound for countdown ticks
  - [ ] Add final beep for countdown completion
  - [ ] Implement sound playback utility
  - **Acceptance Criteria:**
    - Sounds are short (<1 second)
    - File format: MP3 (broad compatibility)
    - Volume controllable via settings
    - Mute option available

---

## Phase 3: Enhanced Playback Flow

**Estimated Time:** 3-4 hours
**Dependencies:** Phase 2 (animations), existing YouTube Player module

### 3.1 Gameplay Screen Updates

- [ ] **Task:** Add Preparation Phase
  - [ ] Show 5-second countdown before song starts
  - [ ] Display "Macht euch bereit!" message
  - [ ] Play beep sound on each tick
  - [ ] Transition to playback on completion
  - **Acceptance Criteria:**
    - Countdown is visible and prominent
    - Countdown completes before song starts
    - Users cannot skip countdown (enforced timing)

- [ ] **Task:** Add Vinyl Overlay During Playback
  - [ ] Initialize vinyl animator
  - [ ] Show vinyl overlay when song starts
  - [ ] Hide YouTube player controls and video
  - [ ] Start vinyl rotation animation
  - **Acceptance Criteria:**
    - Video is completely hidden (black overlay)
    - Audio plays normally
    - Vinyl rotates smoothly at 33.3 RPM
    - Overlay covers entire player area

- [ ] **Task:** Add End Phase
  - [ ] Stop vinyl animation when song ends
  - [ ] Show 5-second countdown
  - [ ] Display "Runde zu Ende!" message
  - [ ] Play signal tone at completion
  - [ ] Transition to reveal phase
  - **Acceptance Criteria:**
    - Vinyl stops rotating
    - Countdown is prominent
    - Signal tone is distinct from tick beeps
    - Smooth transition to reveal screen

### 3.2 YouTube Player Integration

- [ ] **Task:** Update YouTube Player Controls
  - [ ] Ensure player starts at configured time
  - [ ] Stop player after configured duration
  - [ ] Handle player state changes
  - [ ] Manage player visibility (hidden during vinyl overlay)
  - **Acceptance Criteria:**
    - Song starts at `song.startTime` seconds
    - Song stops after `gameState.songDuration` seconds
    - Player API errors handled gracefully
    - Player hidden but audio audible

---

## Phase 4: Song Reveal & Manual Scoring

**Estimated Time:** 2-3 hours
**Dependencies:** Phase 3 (playback flow)

### 4.1 Round Reveal Screen

- [ ] **Task:** Create `js/screens/round-reveal.js`
  - [ ] Implement screen controller class
  - [ ] Add render method for song info display
  - [ ] Add destroy method for cleanup
  - **Acceptance Criteria:**
    - Follows existing screen controller pattern
    - Registered in app.js router
    - Navigable via `App.navigate('round-reveal')`

- [ ] **Task:** Display Song Information
  - [ ] Show album cover (YouTube thumbnail or placeholder)
  - [ ] Display title, artist, year, genre, album
  - [ ] Format information in card layout
  - [ ] Add visual hierarchy (title most prominent)
  - **Acceptance Criteria:**
    - All song metadata displayed clearly
    - Responsive layout (mobile and desktop)
    - Album cover loads gracefully (placeholder on error)
    - Accessible text contrast ratios (WCAG AA)

- [ ] **Task:** Add Video Replay Button
  - [ ] Create "Video komplett ansehen" button
  - [ ] Load full YouTube video in modal or inline
  - [ ] Support play/pause controls
  - [ ] Allow closing video player
  - **Acceptance Criteria:**
    - Button is prominent and clear
    - Video plays from beginning (not startTime)
    - Modal/player can be closed easily
    - Video pauses when closed

### 4.2 Manual Scoring UI

- [ ] **Task:** Create Team Scoring Checkboxes
  - [ ] Display checkbox for each team
  - [ ] Show team name and color
  - [ ] Show current team score
  - [ ] Add visual feedback on check/uncheck
  - **Acceptance Criteria:**
    - Each team has a distinct checkbox
    - Team color is visible (border or background)
    - Checkboxes are large (min 44x44px)
    - Current scores displayed prominently

- [ ] **Task:** Implement Scoring Logic
  - [ ] Track which teams are marked correct
  - [ ] Calculate points based on question type
  - [ ] Update team scores in game state
  - [ ] Show score change animation (+100 pts)
  - **Acceptance Criteria:**
    - Points awarded according to CONFIG.GAME.questionWeights
    - Scores persist to game state and storage
    - Score changes are visible to user
    - State updates trigger subscriber notifications

- [ ] **Task:** Add "Weiter" Button
  - [ ] Create "Nächste Runde" button
  - [ ] Disable until at least one checkbox is checked
  - [ ] Show rounds remaining counter
  - [ ] Navigate to next round on click
  - **Acceptance Criteria:**
    - Button disabled initially (until scoring)
    - Button enabled after any checkbox is checked
    - Clicking button advances to next round
    - Last round navigates to results screen

### 4.3 Score Persistence

- [ ] **Task:** Update Game State with Scores
  - [ ] Save team scores after each round
  - [ ] Save round-by-round score history
  - [ ] Update team statistics (correctAnswers, wrongAnswers)
  - [ ] Persist to LocalStorage
  - **Acceptance Criteria:**
    - Scores saved immediately after "Weiter" clicked
    - Game state includes full score history
    - LocalStorage updated via Storage module
    - State changes trigger UI updates

---

## Phase 5: Integration & Testing

**Estimated Time:** 2-3 hours
**Dependencies:** All previous phases

### 5.1 Full Game Flow Integration

- [ ] **Task:** Connect Game Setup to Gameplay
  - [ ] Pass all configuration to game state
  - [ ] Validate configuration before starting
  - [ ] Initialize game with selected options
  - **Acceptance Criteria:**
    - All setup options reflected in gameplay
    - Game uses selected question types only
    - Songs filtered by genre/decade correctly
    - Song duration matches configured value

- [ ] **Task:** Connect Gameplay to Reveal
  - [ ] Transition from playback to reveal smoothly
  - [ ] Pass song data to reveal screen
  - [ ] Pass team data for scoring
  - **Acceptance Criteria:**
    - No flickering during transition
    - All song data available in reveal screen
    - Team list matches game state

- [ ] **Task:** Connect Reveal to Next Round
  - [ ] Save scores and proceed to next round
  - [ ] Cycle through playlist
  - [ ] Navigate to results after final round
  - **Acceptance Criteria:**
    - Rounds advance sequentially
    - No duplicate songs played
    - Results screen shows after last round

### 5.2 Responsive Testing

- [ ] **Task:** Test on Mobile Devices
  - [ ] Test game setup UI (iOS Safari, Android Chrome)
  - [ ] Test animations (card shuffle, vinyl)
  - [ ] Test countdown timers
  - [ ] Test scoring checkboxes (touch targets)
  - **Acceptance Criteria:**
    - All touch targets ≥44x44px
    - Animations run at ≥30 FPS
    - No horizontal scrolling
    - Keyboard opens without layout shift

- [ ] **Task:** Test on Desktop Browsers
  - [ ] Test Chrome, Firefox, Safari, Edge
  - [ ] Test different screen sizes (1280px, 1920px)
  - [ ] Test keyboard navigation
  - **Acceptance Criteria:**
    - Consistent appearance across browsers
    - Keyboard navigation works (Tab, Enter, Space)
    - No layout issues at any common resolution

### 5.3 Performance Optimization

- [ ] **Task:** Optimize Animations
  - [ ] Ensure GPU acceleration (transform/opacity only)
  - [ ] Add will-change hints where appropriate
  - [ ] Profile animation frame rates
  - **Acceptance Criteria:**
    - All animations run at 60 FPS on target devices
    - No layout thrashing detected
    - Paint/composite time <16ms per frame

- [ ] **Task:** Optimize State Updates
  - [ ] Minimize re-renders during gameplay
  - [ ] Batch state updates where possible
  - [ ] Profile JavaScript execution time
  - **Acceptance Criteria:**
    - No janky UI updates
    - State changes propagate within 100ms
    - No memory leaks over 30+ rounds

### 5.4 Bug Fixes & Polish

- [ ] **Task:** Edge Case Handling
  - [ ] Test with 1 team (solo mode)
  - [ ] Test with 10 teams (max)
  - [ ] Test with 1 round
  - [ ] Test with 50 rounds
  - [ ] Test with very limited song filters (few matching songs)
  - **Acceptance Criteria:**
    - No crashes with edge cases
    - Appropriate error messages shown
    - UI remains usable in all scenarios

- [ ] **Task:** Error Recovery
  - [ ] Test YouTube API failures (video unavailable)
  - [ ] Test LocalStorage quota exceeded
  - [ ] Test browser back button during game
  - **Acceptance Criteria:**
    - Graceful error messages shown
    - User can recover without losing progress
    - State persists across page reloads

- [ ] **Task:** Accessibility Improvements
  - [ ] Add ARIA labels to all interactive elements
  - [ ] Test with screen reader (VoiceOver/TalkBack)
  - [ ] Ensure focus management during navigation
  - [ ] Add keyboard shortcuts documentation
  - **Acceptance Criteria:**
    - All controls are screen-reader accessible
    - Focus moves logically through UI
    - No focus traps
    - Color contrast meets WCAG AA

---

## Acceptance Criteria Summary

### Must Have (MVP)
- ✅ Game setup allows configuring question types, genres, decades, song duration
- ✅ Card shuffle animation plays before each round
- ✅ Vinyl overlay hides video during playback
- ✅ Preparation and end countdowns work correctly
- ✅ Manual scoring UI allows checking teams as correct
- ✅ Scores persist and update game state
- ✅ Full game flow works from setup to results

### Should Have (Post-MVP)
- Settings toggle to disable animations
- Auto-save configuration presets
- Undo button for accidental score changes
- Song preview in setup to verify filters

### Could Have (Future)
- Custom genre groups (user-defined)
- Animated score change counters
- Confetti animation for winning team
- Share results as image/social media

---

## Testing Checklist

### Functional Tests
- [ ] Create game with all question types enabled
- [ ] Create game with only 1 question type
- [ ] Create game with all genres enabled
- [ ] Create game with only 1 genre group
- [ ] Create game with all decades
- [ ] Create game with single decade
- [ ] Play full game with 2 teams, 3 rounds
- [ ] Play full game with 4 teams, 10 rounds
- [ ] Verify scores calculated correctly
- [ ] Verify scores persist after page reload
- [ ] Test video replay functionality
- [ ] Test "Weiter" button enabling/disabling

### Visual Regression Tests
- [ ] Card shuffle animation looks smooth
- [ ] Vinyl rotation is consistent
- [ ] Countdown numbers are readable
- [ ] Song info card is well-formatted
- [ ] Team checkboxes align properly
- [ ] Mobile layout has no overflow

### Performance Tests
- [ ] Measure animation FPS (target: 60)
- [ ] Measure state update latency (target: <100ms)
- [ ] Measure LocalStorage write time (target: <50ms)
- [ ] Monitor memory usage over 30 rounds (target: <50MB growth)

---

## Dependencies

### Internal
- `js/config.js` - Configuration constants
- `js/state.js` - State management
- `js/modules/storage.js` - Persistence
- `js/modules/database.js` - Song filtering
- `js/modules/youtube-player.js` - Video playback
- `js/screens/game-setup.js` - Existing setup screen
- `js/screens/gameplay.js` - Existing gameplay screen

### External
- YouTube IFrame API (already integrated)
- Browser APIs: localStorage, requestAnimationFrame, Audio

### Assets
- Vinyl record image/SVG
- Countdown beep sound (MP3)
- Signal tone sound (MP3)
- Question card background (SVG/PNG)

---

## Rollout Plan

### Step 1: Development
1. Complete all Phase 1-5 tasks
2. Test locally on multiple devices
3. Fix all critical bugs

### Step 2: Internal Testing
1. Play 5+ full games with different configurations
2. Collect feedback on UX
3. Refine animations and timing

### Step 3: Deployment
1. Commit changes to git repository
2. Archive OpenSpec change proposal
3. Merge specs to `openspec/specs/gameplay/`
4. Update documentation

### Step 4: Monitoring
1. Watch for user-reported issues
2. Monitor performance on different devices
3. Gather usage data (which configurations are popular)

---

## Notes

- All tasks follow existing code patterns (Screen Controllers, Observable State)
- No external libraries required (vanilla JS/CSS)
- Mobile-first approach for all UI components
- Backwards compatible with existing game states
