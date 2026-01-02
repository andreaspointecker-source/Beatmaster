# Playlist Test Mode - OpenSpec

## Overview

Enable a simple test mode to play through a generated or selected playlist in gameplay mode without starting a full game. The goal is to verify the playlist order, playback timing, and metadata in the real UI.

**Priority:** Medium
**Status:** In Progress
**Estimated Effort:** 1-2 days
**Started:** 2026-01-01

---

## Goals

- Allow users to test a playlist inside gameplay mode.
- Provide controls to skip, pause, and jump to the next song.
- Show basic song metadata while testing.
- Reuse existing YouTube player and timing logic.

---

## Tasks

### 1. Playlist Test Entry
- [ ] Add a "Playlist testen" entry point (home or database manager)
- [ ] Provide a shortcut to start test with current filters
- [ ] Store test mode flag in State

**Acceptance Criteria:**
- Entry point is visible and opens test mode
- Test mode is separate from regular game flow

### 2. Playlist Source
- [ ] Allow using current filtered songs as playlist
- [ ] Allow using all songs as playlist
- [ ] Optional: allow a manual list of selected songs

**Acceptance Criteria:**
- Playlist can be created from current filters or full library
- Order is deterministic for a given playlist (no shuffle unless requested)

### 3. Gameplay Test UI
- [ ] Reuse gameplay screen with a "Test" header
- [ ] Show current song title, artist, year, genre
- [ ] Show progress (song index / total)
- [ ] Add controls: Play/Pause, Next, Previous, Stop

**Acceptance Criteria:**
- Test UI looks like gameplay but clearly marked as test mode
- Buttons work reliably and update the UI

### 4. Playback Behavior
- [ ] Use song.startTime and duration (default duration 30s)
- [ ] Auto-advance to next song after duration
- [ ] Stop returns to previous screen and clears test state

**Acceptance Criteria:**
- Playback respects startTime and duration
- Auto-advance works across playlist
- Stop exits test mode cleanly

### 5. State Integration
- [ ] Add State keys: playlistTest, playlistTestIndex
- [ ] Ensure test mode does not modify game history
- [ ] Persist last used playlist test settings (optional)

**Acceptance Criteria:**
- Test mode is isolated from regular game state
- No history records created

---

## Testing Checklist

### Functional
- [ ] Can start test from library with filters applied
- [ ] Can start test from full library
- [ ] Play/Pause toggles correctly
- [ ] Next/Previous moves in playlist
- [ ] Auto-advance after duration
- [ ] Stop exits test mode and restores navigation

### Edge Cases
- [ ] Empty playlist shows warning
- [ ] Single song playlist loops or stops (defined behavior)
- [ ] Missing youtubeId shows error and skips

---

## File Changes

### New/Modified Files
- `js/screens/gameplay.js` (test header, controls)
- `js/screens/database-manager.js` or `js/screens/home.js` (entry point)
- `js/state.js` (test mode state keys)
- `js/modules/game-engine.js` (optional: test flow helpers)

---

## Notes

- Test mode should not affect score, teams, or history.
- Keep implementation minimal to allow fast validation of song data.

---

**Last Updated:** 2026-01-01
**Next Review:** After initial implementation
